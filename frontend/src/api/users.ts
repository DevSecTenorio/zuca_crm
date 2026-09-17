import { apiClient } from './client';
import type { UserRole, UserStatus } from '@/types/api';

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export async function listUsers(): Promise<OrgUser[]> {
  const { data } = await apiClient.get<OrgUser[]>('/users');
  return data;
}

export async function createUser(payload: CreateUserInput): Promise<OrgUser> {
  const { data } = await apiClient.post<OrgUser>('/users', payload);
  return data;
}

export async function updateUser(id: string, payload: UpdateUserInput): Promise<OrgUser> {
  const { data } = await apiClient.patch<OrgUser>(`/users/${id}`, payload);
  return data;
}

export async function changeUserPassword(id: string, newPassword: string): Promise<void> {
  await apiClient.patch(`/users/${id}/password`, { newPassword });
}

export interface OwnProfile extends OrgUser {
  avatarUrl: string | null;
  createdAt: string;
}

export async function getOwnProfile(): Promise<OwnProfile> {
  const { data } = await apiClient.get<OwnProfile>('/users/me');
  return data;
}

export async function updateOwnProfile(name: string): Promise<OwnProfile> {
  const { data } = await apiClient.patch<OwnProfile>('/users/me', { name });
  return data;
}

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.patch('/users/me/password', { currentPassword, newPassword });
}
