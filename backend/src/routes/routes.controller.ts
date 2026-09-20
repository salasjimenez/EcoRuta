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
import { CreatePlannedRouteDto } from './dto/create-planned-route.dto';
import { UpdatePlannedRouteDto } from './dto/update-planned-route.dto';
import { UpdateRouteCapacityDto } from './dto/update-route-capacity.dto';
import { RoutesService } from './routes.service';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TRANSPORTER)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePlannedRouteDto) {
    return this.routesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.routesService.findAll(user.id);
  }

  @Get(':id/capacity')
  getCapacity(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.routesService.getCapacity(user.id, id);
  }

  @Patch(':id/capacity')
  updateCapacity(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRouteCapacityDto,
  ) {
    return this.routesService.updateCapacity(user.id, id, dto);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.routesService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePlannedRouteDto,
  ) {
    return this.routesService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.routesService.remove(user.id, id);
  }
}
