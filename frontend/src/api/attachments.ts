import { apiClient } from './client';

export type AttachmentEntityType = 'deal' | 'company';

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
  createdAt: string;
  uploadedByName: string | null;
  url: string;
}

export async function listAttachments(
  entityType: AttachmentEntityType,
  entityId: string,
): Promise<Attachment[]> {
  const { data } = await apiClient.get<Attachment[]>(
    `/attachments/${entityType}/${entityId}`,
  );
  return data;
}

export async function uploadAttachment(
  entityType: AttachmentEntityType,
  entityId: string,
  file: File,
): Promise<Attachment> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<Attachment>(
    `/attachments/${entityType}/${entityId}`,
    formData,
  );
  return data;
}

export async function deleteAttachment(id: string): Promise<void> {
  await apiClient.delete(`/attachments/${id}`);
}
