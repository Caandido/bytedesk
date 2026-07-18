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
  ],
})
export class AppModule {}
