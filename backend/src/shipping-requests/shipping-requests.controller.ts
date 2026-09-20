import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserRole } from '../users/user-role.enum';
import { CreateShippingRequestDto } from './dto/create-shipping-request.dto';
import { UpdateShippingRequestDto } from './dto/update-shipping-request.dto';
import { ShippingRequestsService } from './shipping-requests.service';

@Controller('shipping-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
export class ShippingRequestsController {
  constructor(
    private readonly shippingRequestsService: ShippingRequestsService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateShippingRequestDto,
  ) {
    return this.shippingRequestsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.shippingRequestsService.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.shippingRequestsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateShippingRequestDto,
  ) {
    return this.shippingRequestsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.shippingRequestsService.remove(user.id, id);
  }
}
