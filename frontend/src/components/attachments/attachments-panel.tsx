'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { IconPaperclip, IconDownload, IconTrash, IconUpload } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '@/hooks/useAttachments';
import { formatDateTime, formatFileSize } from '@/lib/format';
import type { AttachmentEntityType } from '@/api/attachments';

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

interface AttachmentsPanelProps {
  entityType: AttachmentEntityType;
  entityId: string;
}

export function AttachmentsPanel({ entityType, entityId }: AttachmentsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = useAttachments(entityType, entityId);
  const uploadAttachment = useUploadAttachment(entityType, entityId);
  const deleteAttachment = useDeleteAttachment(entityType, entityId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Arquivo muito grande. O limite é 4MB por arquivo.');
      return;
    }
    uploadAttachment.mutate(file);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Anexos</CardTitle>
        <Button
          size="sm"
          variant="outline"
          disabled={uploadAttachment.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload size={16} className="mr-1.5" />
          {uploadAttachment.isPending ? 'Enviando...' : 'Adicionar arquivo'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && attachments?.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
        )}
        {attachments?.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 rounded-md border p-2.5 text-sm"
          >
            <IconPaperclip size={16} className="shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.sizeBytes)} · {formatDateTime(attachment.createdAt)}
                {attachment.uploadedByName && ` · ${attachment.uploadedByName}`}
              </p>
            </div>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" title="Baixar">
                <IconDownload size={16} />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="icon"
              title="Excluir"
              disabled={deleteAttachment.isPending}
              onClick={() => deleteAttachment.mutate(attachment.id)}
            >
              <IconTrash size={16} className="text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
