'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deleteAttachment,
  listAttachments,
  uploadAttachment,
  type AttachmentEntityType,
} from '@/api/attachments';

const ATTACHMENTS_KEY = ['attachments'];

export function useAttachments(entityType: AttachmentEntityType, entityId: string) {
  return useQuery({
    queryKey: [...ATTACHMENTS_KEY, entityType, entityId],
    queryFn: () => listAttachments(entityType, entityId),
    enabled: !!entityId,
  });
}

export function useUploadAttachment(entityType: AttachmentEntityType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(entityType, entityId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ATTACHMENTS_KEY, entityType, entityId] });
      toast.success('Arquivo anexado');
    },
    onError: () => toast.error('Erro ao anexar arquivo'),
  });
}

export function useDeleteAttachment(entityType: AttachmentEntityType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ATTACHMENTS_KEY, entityType, entityId] });
      toast.success('Anexo removido');
    },
    onError: () => toast.error('Erro ao remover anexo'),
  });
}
