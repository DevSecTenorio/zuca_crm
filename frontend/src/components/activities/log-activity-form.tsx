'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateActivity } from '@/hooks/useActivities';
import { ACTIVITY_TYPE_LABELS } from '@/lib/deal-stages';
import type { ActivityType } from '@/types/api';

const ACTIVITY_TYPES: ActivityType[] = ['note', 'call', 'email', 'meeting', 'task'];

export function LogActivityForm({
  dealId,
  contactId,
  companyId,
}: {
  dealId?: string;
  contactId?: string;
  companyId?: string;
}) {
  const [type, setType] = useState<ActivityType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createActivity = useCreateActivity();

  const submit = () => {
    if (!title.trim() && !description.trim()) return;
    createActivity.mutate(
      {
        type,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        dealId,
        contactId,
        companyId,
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setType('note');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIVITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {ACTIVITY_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
      </div>
      <Textarea
        placeholder="Descreva o que aconteceu..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={submit}
          disabled={createActivity.isPending || (!title.trim() && !description.trim())}
        >
          Registrar
        </Button>
      </div>
    </div>
  );
}
