import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto/task.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/**
 * API do sub-módulo Tarefas (Kanban), aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/tasks. Opera no workspace ativo.
 */
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.findAllByProject(projectId, workspaceId);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.create(projectId, dto, workspaceId);
  }

  @Patch(':taskId')
  update(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.update(projectId, taskId, dto, workspaceId);
  }

  @Patch(':taskId/move')
  move(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.move(projectId, taskId, dto, workspaceId);
  }

  @Delete(':taskId')
  remove(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tasksService.remove(projectId, taskId, workspaceId);
  }
}
