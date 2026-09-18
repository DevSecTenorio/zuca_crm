'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconPlus,
  IconSearch,
  IconBuilding,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconMail,
  IconPhone,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanyFormDialog } from '@/components/companies/company-form-dialog';
import { DeleteCompanyDialog } from '@/components/companies/delete-company-dialog';
import { useCompanies } from '@/hooks/useCompanies';
import type { Company } from '@/types/api';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const { data: companies, isLoading } = useCompanies(search || undefined);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  return (
    <div>
      <PageHeader
        title="Empresas"
        description="Clientes e fornecedores da sua operação"
        actions={
          <CompanyFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Nova Empresa
              </Button>
            }
          />
        }
      />

      <div className="mb-4">
        <div className="relative w-full max-w-xs">
          <IconSearch
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {!isLoading && companies?.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma empresa encontrada.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {companies?.map((company) => (
          <Card key={company.id} className="h-full transition-colors hover:bg-muted/40">
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/companies/${company.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <IconBuilding size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{company.razaoSocial}</p>
                    {company.nomeFantasia && (
                      <p className="truncate text-xs text-muted-foreground">
                        {company.nomeFantasia}
                      </p>
                    )}
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <IconDotsVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditingCompany(company)}>
                      <IconPencil size={16} /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeletingCompany(company)}
                    >
                      <IconTrash size={16} /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {company.cnpj && <span>{company.cnpj}</span>}
                {company.segment && <span>{company.segment.name}</span>}
              </div>
              {(company.email || company.phone) && (
                <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {company.email && (
                    <div className="flex items-center gap-1.5">
                      <IconMail size={14} /> {company.email}
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-1.5">
                      <IconPhone size={14} /> {company.phone}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CompanyFormDialog
        company={editingCompany ?? undefined}
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
      />
      <DeleteCompanyDialog
        company={deletingCompany}
        open={!!deletingCompany}
        onOpenChange={(open) => !open && setDeletingCompany(null)}
      />
    </div>
  );
}
