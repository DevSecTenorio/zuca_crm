import { apiClient } from './client';
import type { Company } from '@/types/api';

export interface CompanyInput {
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  segmentId?: string;
  website?: string;
  phone?: string;
  email?: string;
}

export async function listCompanies(search?: string): Promise<Company[]> {
  const { data } = await apiClient.get<Company[]>('/companies', { params: { search } });
  return data;
}

export async function getCompany(id: string): Promise<Company> {
  const { data } = await apiClient.get<Company>(`/companies/${id}`);
  return data;
}

export async function createCompany(payload: CompanyInput): Promise<Company> {
  const { data } = await apiClient.post<Company>('/companies', payload);
  return data;
}

export async function updateCompany(id: string, payload: Partial<CompanyInput>): Promise<Company> {
  const { data } = await apiClient.patch<Company>(`/companies/${id}`, payload);
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`);
}
