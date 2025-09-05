import { Client } from '@elastic/elasticsearch';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticsearchService {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;

  constructor(private configService: ConfigService) {
    const elasticsearchUrl =
      this.configService.get<string>('ELASTICSEARCH_URL');

    try {
      this.client = new Client({
        node: elasticsearchUrl,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(
        `Successfully connected to Elasticsearch at ${elasticsearchUrl}`,
      );
    } catch (error) {
      this.logger.error(
        `Error initializing Elasticsearch client at ${elasticsearchUrl}`,
        error,
      );
    }
  }

  async index(index: string, id: string, data: any) {
    if (!this.client) {
      throw new Error('Elasticsearch client is not initialized');
    }

    try {
      return await this.client.index({
        index,
        id,
        body: data,
      });
    } catch (error) {
      this.logger.error('Error indexing document in Elasticsearch', error);
      throw error;
    }
  }

  async search(index: string, query: any) {
    if (!this.client) {
      throw new Error('Elasticsearch client is not initialized');
    }

    try {
      return await this.client.search({
        index,
        body: query,
      });
    } catch (error) {
      this.logger.error('Error searching documents in Elasticsearch', error);
      throw error;
    }
  }

  async delete(index: string, id: string) {
    if (!this.client) {
      throw new Error('Elasticsearch client is not initialized');
    }

    try {
      return await this.client.delete({
        index,
        id,
      });
    } catch (error) {
      this.logger.error('Error deleting document in Elasticsearch', error);
      throw error;
    }
  }
}
