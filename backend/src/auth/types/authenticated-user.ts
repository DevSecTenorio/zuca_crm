import { UserRole } from '../../users/user.entity';

export interface AuthenticatedUser {
  id: string;
  orgId: string;
  email: string;
  role: UserRole;
}
