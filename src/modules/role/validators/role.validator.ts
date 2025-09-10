import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories';
import { RoleData } from 'src/interfaces';
import { ensureFieldUnique } from 'src/common/db.validator';

@Injectable()
export class RoleValidator {
  constructor(private readonly roleRepository: RoleRepository) {}

  async validateRoleName(
    field: 'Code',
    value: string,
    excludeId?: string,
  ): Promise<void> {
    await ensureFieldUnique(
      this.roleRepository,
      field,
      value,
      'Code',
      excludeId,
    );
  }
  async ensureRoleExists(Id: string): Promise<RoleData> {
    const role = await this.roleRepository.findById(Id);
    if (!role) {
      throw new HttpException(
        `Role với ID ${Id} không tồn tại`,
        HttpStatus.NOT_FOUND,
      );
    }
    return role;
  }
}
