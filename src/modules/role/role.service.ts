import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from 'src/config/elasticsearch/elasticsearch.service';

import { RoleRepository } from './repositories';
import { RoleValidator } from './validators';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RoleData, RoleResponse } from 'src/interfaces';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly roleValidator: RoleValidator,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponse> {
    await this.roleValidator.validateRoleName('Code', createRoleDto.Code);

    const role = await this.roleRepository.createRole({
      Name: createRoleDto.Name,
      Code: createRoleDto.Code,
    });

    return role;
  }

  async findAll(): Promise<RoleResponse[]> {
    return this.roleRepository.findAllRoles();
  }

  async findOne(id: string): Promise<RoleResponse> {
    return this.roleValidator.ensureRoleExists(id);
  }

  async update(updateRoleDto: UpdateRoleDto): Promise<RoleResponse> {
    const { Id, Name, Code } = updateRoleDto;

    if (!Code) {
      throw new Error('Code là bắt buộc');
    }

    if (!Name) {
      throw new Error('Name là bắt buộc');
    }

    await this.roleValidator.ensureRoleExists(Id);
    await this.roleValidator.validateRoleName('Code', Code);

    const role = await this.roleRepository.updateRole(Id, { Name, Code });

    return role;
  }

  async remove(id: string) {
    await this.roleValidator.ensureRoleExists(id);
    await this.roleRepository.deleteRole(id);
    return {};
  }

  async findByName(Name: string, Code: string): Promise<RoleData> {
    const result = await this.elasticsearchService.search('roles', {
      query: {
        bool: {
          must: [{ match: { Name } }, { match: { Code } }],
        },
      },
    });

    if (
      !result ||
      !result.hits ||
      !result.hits.hits ||
      (typeof result.hits.total === 'object'
        ? result.hits.total.value
        : result.hits.total) === 0
    ) {
      throw new Error(`Role với tên ${Name} không tìm thấy`);
    }

    if (!result.hits.hits[0]?._source) {
      throw new Error('Dữ liệu role không hợp lệ');
    }

    return result.hits.hits[0]._source as RoleData;
  }
}
