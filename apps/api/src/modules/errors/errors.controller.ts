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

/** API do módulo Banco de Erros. Rotas finais em /api/errors. */
@Controller('errors')
export class ErrorsController {
  constructor(private readonly errorsService: ErrorsService) {}

  @Get()
  findAll() {
    return this.errorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.errorsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateKnownErrorDto) {
    return this.errorsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKnownErrorDto) {
    return this.errorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.errorsService.remove(id);
  }
}
