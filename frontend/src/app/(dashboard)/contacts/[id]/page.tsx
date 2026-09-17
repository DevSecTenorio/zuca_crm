'use client';

import { use } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconPhone, IconMail } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContact } from '@/hooks/useContacts';
import { useContactActivities } from '@/hooks/useActivities';
import { QuickNoteForm } from '@/components/contacts/quick-note-form';
import { getInitials, formatDateTime } from '@/lib/format';
import { ACTIVITY_TYPE_LABELS } from '@/lib/deal-stages';

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: contact, isLoading } = useContact(id);
  const { data: activities } = useContactActivities(id);

  if (isLoading || !contact) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div>
      <Link
        href="/contacts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} /> Voltar para Contatos
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 pt-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {getInitials(contact.name)}
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold">{contact.name}</h2>
              {contact.linkedCompany && (
                <p className="text-sm text-muted-foreground">{contact.linkedCompany.razaoSocial}</p>
              )}
            </div>
            <div className="flex w-full flex-col gap-2 text-left text-sm">
              {contact.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconMail size={16} /> {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconPhone size={16} /> {contact.phone}
                </div>
              )}
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {(contact.source || contact.campaign) && (
              <div className="flex w-full flex-col gap-1 border-t pt-3 text-left text-xs text-muted-foreground">
                {contact.source && <span>Fonte: {contact.source.name}</span>}
                {contact.campaign && <span>Campanha: {contact.campaign.name}</span>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <QuickNoteForm contactId={id} />

            <div className="flex flex-col gap-3">
              {activities?.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
              )}
              {activities?.map((activity) => (
                <div key={activity.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{ACTIVITY_TYPE_LABELS[activity.type]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.createdAt)}
                    </span>
                  </div>
                  {activity.title && <p className="mt-1 text-sm font-medium">{activity.title}</p>}
                  {activity.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{activity.description}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
