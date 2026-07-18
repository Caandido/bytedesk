import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { WorkspaceId } from '../auth/auth.decorators';

/** Pesquisa global. Rota final em /api/search?q=termo. */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@WorkspaceId() workspaceId: string, @Query('q') q?: string) {
    return this.searchService.search(q ?? '', workspaceId);
  }
}
