import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ErrorsService } from './errors.service';
import { CreateKnownErrorDto, UpdateKnownErrorDto } from './dto/error.dto';
import { WorkspaceId } from '../auth/auth.decorators';

/** API do módulo Banco de Erros. Rotas finais em /api/errors. */
@Controller('errors')
export class ErrorsController {
  constructor(private readonly errorsService: ErrorsService) {}

  @Get()
  findAll(@WorkspaceId() workspaceId: string) {
    return this.errorsService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.errorsService.findOne(id, workspaceId);
  }

  @Post()
  create(@Body() dto: CreateKnownErrorDto, @WorkspaceId() workspaceId: string) {
    return this.errorsService.create(dto, workspaceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKnownErrorDto,
    @WorkspaceId() workspaceId: string,
  ) {
    return this.errorsService.update(id, dto, workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @WorkspaceId() workspaceId: string) {
    return this.errorsService.remove(id, workspaceId);
  }
}
