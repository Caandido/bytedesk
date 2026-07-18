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

/**
 * API do sub-módulo Tarefas (Kanban), aninhada sob o projeto.
 * Rotas finais em /api/projects/:projectId/tasks.
 */
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Param('projectId') projectId: string) {
    return this.tasksService.findAllByProject(projectId);
  }

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto);
  }

  @Patch(':taskId')
  update(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(projectId, taskId, dto);
  }

  @Patch(':taskId/move')
  move(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(projectId, taskId, dto);
  }

  @Delete(':taskId')
  remove(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(projectId, taskId);
  }
}
