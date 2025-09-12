import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierRepository } from './repositories/supplier.repository';
import { SupplierValidator } from './validators/supplier.validator';
import { ISupplierResponse } from './dto/response.dto';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly supplierValidator: SupplierValidator,
  ) {}
  async create(createSupplierDto: CreateSupplierDto) {
    const errors = await this.supplierValidator.checkSupplierUniqueFields(
      createSupplierDto,
      this.supplierRepository,
    );
    if (errors.length > 0) {
      const msg = errors.map((e) => `${e.Property}: ${e.Message}`).join('; ');
      throw new ConflictException(msg);
    }
    const supplier =
      await this.supplierRepository.createSupplier(createSupplierDto);
    return supplier;
  }

  async findAll(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<ISupplierResponse> {
    const [data, count] = await this.supplierRepository.findAllSuppliers(
      page,
      pageSize,
      searchText,
    );
    return new ISupplierResponse(data, count);
  }

  async findOne(id: string) {
    const checkExist = await this.supplierRepository.findOneById(id);
    if (!checkExist) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp với id ${id}`);
    }
    return checkExist;
  }
  UpdateSupplierDto;
  async update(updateSupplierDto: UpdateSupplierDto) {
    const existingSupplier = await this.supplierRepository.findOneById(
      updateSupplierDto.Id,
    );
    if (!existingSupplier) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp`);
    }

    const errors = await this.supplierValidator.checkSupplierUniqueFields(
      updateSupplierDto,
      this.supplierRepository,
    );
    if (errors.length > 0) {
      const msg = errors.map((e) => `${e.Property}: ${e.Message}`).join('; ');
      throw new ConflictException(msg);
    }
    const updateSupplier = await this.supplierRepository.updateSupplier(
      updateSupplierDto.Id,
      updateSupplierDto,
    );
    return updateSupplier;
  }

  async remove(id: string) {
    const checkExist = await this.supplierRepository.findOneById(id);
    if (!checkExist) {
      throw new NotFoundException(`Không tìm thấy nhà cung cấp `);
    }
    await this.supplierRepository.deleteSupplier(id);

    return {};
  }
}
