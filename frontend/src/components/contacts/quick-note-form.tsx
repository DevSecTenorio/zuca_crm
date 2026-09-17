'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateActivity } from '@/hooks/useActivities';

export function QuickNoteForm({ contactId }: { contactId: string }) {
  const [note, setNote] = useState('');
  const createActivity = useCreateActivity();

  const submit = () => {
    if (!note.trim()) return;
    createActivity.mutate(
      { type: 'note', description: note.trim(), contactId },
      { onSuccess: () => setNote('') },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Adicionar nota rápida..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            submit();
          }
        }}
        rows={2}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={createActivity.isPending || !note.trim()}>
          Adicionar nota
        </Button>
      </div>
    </div>
  );
}
