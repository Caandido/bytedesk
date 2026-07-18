import { Controller, Get, Param, Post } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from '../auth/auth.decorators';

/**
 * Convites vistos pelo convidado — resolvidos por **token** (não pelo workspace
 * ativo). Exigem apenas estar autenticado.
 */
@Controller('invites')
export class InvitesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get(':token')
  preview(@Param('token') token: string, @CurrentUser() userId: string) {
    return this.workspaces.previewInvite(token, userId);
  }

  @Post(':token/accept')
  accept(@Param('token') token: string, @CurrentUser() userId: string) {
    return this.workspaces.acceptInvite(token, userId);
  }
}
