import { UserRole } from '../../users/user-role.enum';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};
