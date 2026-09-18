'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconPlus, IconSearch, IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContactFormDialog } from '@/components/contacts/contact-form-dialog';
import { DeleteContactDialog } from '@/components/contacts/delete-contact-dialog';
import { useContacts } from '@/hooks/useContacts';
import { getInitials } from '@/lib/format';
import type { Contact } from '@/types/api';

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const { data: contacts, isLoading } = useContacts(search || undefined);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  return (
    <div>
      <PageHeader
        title="Contatos"
        description="Pessoas e clientes vinculados à sua operação"
        actions={
          <ContactFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Novo Contato
              </Button>
            }
          />
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <IconSearch
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar contato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Empresa</th>
              <th className="px-4 py-3 font-medium">Tags</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            )}
            {!isLoading && contacts?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
            {contacts?.map((contact) => (
              <tr key={contact.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/contacts/${contact.id}`}
                    className="flex items-center gap-2.5 font-medium hover:underline"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {getInitials(contact.name)}
                    </div>
                    {contact.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{contact.email || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">{contact.phone || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {contact.linkedCompany?.razaoSocial || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags?.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <IconDotsVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEditingContact(contact)}>
                        <IconPencil size={16} /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setDeletingContact(contact)}
                      >
                        <IconTrash size={16} /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContactFormDialog
        contact={editingContact ?? undefined}
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
      />
      <DeleteContactDialog
        contact={deletingContact}
        open={!!deletingContact}
        onOpenChange={(open) => !open && setDeletingContact(null)}
      />
    </div>
  );
}
