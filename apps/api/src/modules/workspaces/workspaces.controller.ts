import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import {
  CreateWorkspaceDto,
  CreateInviteDto,
  UpdateMemberDto,
} from './dto/workspace.dto';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { CurrentUser, WorkspaceId } from '../auth/auth.decorators';

/**
 * Gestão de times sobre o **workspace ativo** (header `x-workspace-id`). Criar
 * workspace e listar membros: qualquer usuário/membro. Convidar, remover e mudar
 * papéis: só OWNER/ADMIN (RolesGuard).
 */
@Controller('workspaces')
@UseGuards(RolesGuard)
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(userId, dto);
  }

  @Get('members')
  listMembers(@WorkspaceId() workspaceId: string) {
    return this.workspaces.listMembers(workspaceId);
  }

  @Patch('members/:userId')
  @Roles('OWNER', 'ADMIN')
  updateMemberRole(
    @WorkspaceId() workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.workspaces.updateMemberRole(workspaceId, userId, dto);
  }

  @Delete('members/:userId')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(204)
  removeMember(
    @WorkspaceId() workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspaces.removeMember(workspaceId, userId);
  }

  @Get('invites')
  @Roles('OWNER', 'ADMIN')
  listInvites(@WorkspaceId() workspaceId: string) {
    return this.workspaces.listInvites(workspaceId);
  }

  @Post('invites')
  @Roles('OWNER', 'ADMIN')
  createInvite(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() userId: string,
    @Body() dto: CreateInviteDto,
  ) {
    return this.workspaces.createInvite(workspaceId, userId, dto);
  }

  @Delete('invites/:inviteId')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(204)
  revokeInvite(
    @WorkspaceId() workspaceId: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.workspaces.revokeInvite(workspaceId, inviteId);
  }
}
