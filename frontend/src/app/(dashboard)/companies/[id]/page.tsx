'use client';

import { use } from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconMail, IconMapPin, IconPhone, IconWorld } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompany } from '@/hooks/useCompanies';
import { getInitials } from '@/lib/format';
import { AttachmentsPanel } from '@/components/attachments/attachments-panel';

function formatAddress(address: {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}) {
  const line1 = [address.logradouro, address.numero].filter(Boolean).join(', ');
  const line2 = [address.bairro, address.cidade && address.estado ? `${address.cidade}/${address.estado}` : address.cidade || address.estado]
    .filter(Boolean)
    .join(' - ');
  return [line1, address.complemento, line2, address.cep].filter(Boolean).join(' · ');
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: company, isLoading } = useCompany(id);

  if (isLoading || !company) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div>
      <Link
        href="/companies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconArrowLeft size={16} /> Voltar para Empresas
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col gap-3 pt-4">
            <h2 className="font-heading text-lg font-semibold">{company.razaoSocial}</h2>
            {company.nomeFantasia && (
              <p className="text-sm text-muted-foreground">{company.nomeFantasia}</p>
            )}
            <div className="flex flex-col gap-2 text-sm">
              {company.cnpj && (
                <div className="text-muted-foreground">CNPJ: {company.cnpj}</div>
              )}
              {company.segment && (
                <div className="text-muted-foreground">Segmento: {company.segment.name}</div>
              )}
              {company.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconMail size={16} /> {company.email}
                </div>
              )}
              {company.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconPhone size={16} /> {company.phone}
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <IconWorld size={16} /> {company.website}
                </div>
              )}
              {company.address && Object.values(company.address).some(Boolean) && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <IconMapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{formatAddress(company.address)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contatos vinculados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {(!company.contacts || company.contacts.length === 0) && (
              <p className="text-sm text-muted-foreground">Nenhum contato vinculado.</p>
            )}
            {company.contacts?.map((contact) => (
              <Link
                key={contact.id}
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-2.5 rounded-md border p-3 text-sm hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {getInitials(contact.name)}
                </div>
                <div>
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.email}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <AttachmentsPanel entityType="company" entityId={company.id} />
        </div>
      </div>
    </div>
  );
}
