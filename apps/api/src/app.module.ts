import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { NotesModule } from './modules/notes/notes.module';
import { StudiesModule } from './modules/studies/studies.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { BugsModule } from './modules/bugs/bugs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SearchModule } from './modules/search/search.module';
import { DocsModule } from './modules/docs/docs.module';
import { VersionsModule } from './modules/versions/versions.module';
import { RoadmapsModule } from './modules/roadmaps/roadmaps.module';
import { WikiModule } from './modules/wiki/wiki.module';
import { StatsModule } from './modules/stats/stats.module';
import { DiaryModule } from './modules/diary/diary.module';
import { IdeasModule } from './modules/ideas/ideas.module';
import { ErrorsModule } from './modules/errors/errors.module';
import { ArchitectureModule } from './modules/architecture/architecture.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    NotesModule,
    StudiesModule,
    ProjectsModule,
    TasksModule,
    BugsModule,
    DashboardModule,
    SearchModule,
    DocsModule,
    VersionsModule,
    RoadmapsModule,
    WikiModule,
    StatsModule,
    DiaryModule,
    IdeasModule,
    ErrorsModule,
    ArchitectureModule,
  ],
})
export class AppModule {}
