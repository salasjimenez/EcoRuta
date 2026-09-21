import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { UserRole } from '../users/user-role.enum';
import { MatchingService } from './matching.service';

@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('requests/:requestId/routes')
  @Roles(UserRole.COMPANY)
  findRoutesForRequest(
    @CurrentUser() user: AuthUser,
    @Param('requestId', new ParseUUIDPipe({ version: '4' })) requestId: string,
  ) {
    return this.matchingService.findRoutesForRequest(user.id, requestId);
  }

  @Get('routes/:routeId/requests')
  @Roles(UserRole.TRANSPORTER)
  findRequestsForRoute(
    @CurrentUser() user: AuthUser,
    @Param('routeId', new ParseUUIDPipe({ version: '4' })) routeId: string,
  ) {
    return this.matchingService.findRequestsForRoute(user.id, routeId);
  }
}
