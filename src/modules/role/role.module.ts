import { Module } from '@nestjs/common';
import { ElasticsearchService } from 'src/config/elasticsearch/elasticsearch.service';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories';
import { RoleValidator } from './validators';

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [
    RoleService,
    RoleRepository,
    RoleValidator,
    PrismaService,
    ElasticsearchService,
  ],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
