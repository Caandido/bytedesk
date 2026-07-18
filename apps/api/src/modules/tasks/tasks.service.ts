import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';

/**
 * Regras de acesso a dados do sub-módulo Tarefas (Kanban). O `move` reindexa as
 * posições das colunas de origem e destino em uma transação, garantindo ordem
 * sequencial e sem colisões após qualquer arraste.
 *
 * `Task` é filha de `Project` e não possui `workspaceId` própria: o escopo
 * multi-tenant é aplicado sempre VIA o projeto pai (`project: { workspaceId }`).
 */
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string, workspaceId: string) {
    return this.prisma.task.findMany({
      where: { projectId, project: { workspaceId } },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });
  }

  async create(projectId: string, dto: CreateTaskDto, workspaceId: string) {
    await this.ensureProject(projectId, workspaceId);
    // Nova tarefa vai para o fim da coluna escolhida.
    const count = await this.prisma.task.count({
      where: { projectId, status: dto.status },
    });
    return this.prisma.task.create({
      data: { ...dto, projectId, position: count },
    });
  }

  async update(
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
    workspaceId: string,
  ) {
    await this.ensureTask(projectId, taskId, workspaceId);
    return this.prisma.task.update({ where: { id: taskId }, data: dto });
  }

  async remove(projectId: string, taskId: string, workspaceId: string) {
    const task = await this.ensureTask(projectId, taskId, workspaceId);
    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });
      // Compacta as posições da coluna de onde a tarefa saiu.
      await this.reindexColumn(tx, projectId, task.status, taskId);
    });
    return task;
  }

  /**
   * Move a tarefa para `status`/`position` (índice na coluna de destino) e
   * reindexa origem e destino. Retorna o quadro completo do projeto atualizado.
   */
  async move(
    projectId: string,
    taskId: string,
    dto: MoveTaskDto,
    workspaceId: string,
  ) {
    const task = await this.ensureTask(projectId, taskId, workspaceId);
    const fromStatus = task.status;
    const toStatus = dto.status;

    await this.prisma.$transaction(async (tx) => {
      // Tarefas da coluna de destino (sem a movida), em ordem atual.
      const destTasks = await tx.task.findMany({
        where: { projectId, status: toStatus, id: { not: taskId } },
        orderBy: { position: 'asc' },
        select: { id: true },
      });

      // Insere a movida no índice desejado (clamp em [0, length]).
      const index = Math.max(0, Math.min(dto.position, destTasks.length));
      const orderedIds = [
        ...destTasks.slice(0, index).map((t) => t.id),
        taskId,
        ...destTasks.slice(index).map((t) => t.id),
      ];

      // Aplica posições sequenciais + o novo status na coluna de destino.
      await Promise.all(
        orderedIds.map((id, pos) =>
          tx.task.update({
            where: { id },
            data: { position: pos, status: toStatus },
          }),
        ),
      );

      // Se mudou de coluna, compacta as posições da coluna de origem.
      if (fromStatus !== toStatus) {
        await this.reindexColumn(tx, projectId, fromStatus, taskId);
      }
    });

    return this.findAllByProject(projectId, workspaceId);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Reatribui posições sequenciais (0..n) a uma coluna, ignorando `excludeId`. */
  private async reindexColumn(
    tx: Prisma.TransactionClient,
    projectId: string,
    status: TaskStatus,
    excludeId?: string,
  ): Promise<void> {
    const remaining = await tx.task.findMany({
      where: {
        projectId,
        status,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      orderBy: { position: 'asc' },
      select: { id: true },
    });
    await Promise.all(
      remaining.map((t, pos) =>
        tx.task.update({ where: { id: t.id }, data: { position: pos } }),
      ),
    );
  }

  private async ensureProject(id: string, workspaceId: string): Promise<void> {
    const exists = await this.prisma.project.findFirst({
      where: { id, workspaceId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Projeto ${id} não encontrado`);
    }
  }

  private async ensureTask(
    projectId: string,
    taskId: string,
    workspaceId: string,
  ) {
    // Só encontra a tarefa se o projeto pai pertencer ao workspace ativo.
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, projectId, project: { workspaceId } },
    });
    if (!task) {
      throw new NotFoundException(
        `Tarefa ${taskId} não encontrada no projeto ${projectId}`,
      );
    }
    return task;
  }
}
