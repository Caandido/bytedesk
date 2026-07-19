import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { TokensService } from './tokens.service';
import { CreateApiTokenDto } from './dto/token.dto';
import { CurrentUser, WorkspaceId } from '../auth/auth.decorators';

/** Tokens de API do usuário no workspace ativo. */
@Controller('tokens')
export class TokensController {
  constructor(private readonly tokens: TokensService) {}

  @Get()
  list(
    @CurrentUser() userId: string,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.tokens.list(userId, workspaceId);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @WorkspaceId() workspaceId: string,
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.tokens.create(userId, workspaceId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  revoke(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.tokens.revoke(userId, id);
  }
}
