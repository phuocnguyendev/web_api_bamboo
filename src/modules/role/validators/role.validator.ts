import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories';
import { RoleData } from 'src/interfaces';

@Injectable()
export class RoleValidator {
  constructor(private readonly roleRepository: RoleRepository) {}

  async validateRoleName(Code: string, excludeId?: string): Promise<void> {
    if (!Code) return;

    const role = await this.roleRepository.findByCode(Code);

    if (role && role.Id !== excludeId) {
      throw new HttpException(
        `Role với mã ${Code} đã tồn tại`,
        HttpStatus.CONFLICT,
      );
    }
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
