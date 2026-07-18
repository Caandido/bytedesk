import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { InvitesController } from './invites.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController, InvitesController],
  providers: [WorkspacesService],
})
export class WorkspacesModule {}
