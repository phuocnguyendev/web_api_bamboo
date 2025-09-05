import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Module({
  controllers: [],
  providers: [ElasticsearchService],
})
export class ElasticsearchModule {}
