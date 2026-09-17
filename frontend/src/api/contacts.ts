import { apiClient } from './client';
import type { Contact } from '@/types/api';

export interface ContactInput {
  name: string;
  email?: string;
  phone?: string;
  cnpjCpf?: string;
  tags?: string[];
  linkedCompanyId?: string;
  sourceId?: string;
  campaignId?: string;
}

export async function listContacts(search?: string): Promise<Contact[]> {
  const { data } = await apiClient.get<Contact[]>('/contacts', { params: { search } });
  return data;
}

export async function getContact(id: string): Promise<Contact> {
  const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
  return data;
}

export async function createContact(payload: ContactInput): Promise<Contact> {
  const { data } = await apiClient.post<Contact>('/contacts', payload);
  return data;
}

export async function updateContact(id: string, payload: Partial<ContactInput>): Promise<Contact> {
  const { data } = await apiClient.patch<Contact>(`/contacts/${id}`, payload);
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contacts/${id}`);
}
