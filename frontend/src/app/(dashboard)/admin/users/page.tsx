'use client';

import { IconKey, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserFormDialog } from '@/components/admin/user-form-dialog';
import { UserEditDialog } from '@/components/admin/user-edit-dialog';
import { UserPasswordDialog } from '@/components/admin/user-password-dialog';
import { DeleteUserDialog } from '@/components/admin/delete-user-dialog';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth-store';
import { getInitials } from '@/lib/format';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  rep: 'Rep',
};

export default function UsersAdminPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: users, isLoading } = useUsers();

  if (currentUser?.role !== 'admin') {
    return <p className="text-sm text-muted-foreground">Acesso restrito a administradores.</p>;
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Crie usuários, altere permissões e senhas"
        actions={
          <UserFormDialog
            trigger={
              <Button>
                <IconPlus size={16} className="mr-1.5" /> Novo Usuário
              </Button>
            }
          />
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <Card className="max-w-3xl">
        <CardContent className="flex flex-col gap-1 pt-4">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
              <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              <UserEditDialog
                user={user}
                trigger={
                  <Button variant="ghost" size="icon-sm" title="Editar">
                    <IconPencil size={14} />
                  </Button>
                }
              />
              <UserPasswordDialog
                user={user}
                trigger={
                  <Button variant="ghost" size="icon-sm" title="Trocar senha">
                    <IconKey size={14} />
                  </Button>
                }
              />
              {user.id !== currentUser?.id && (
                <DeleteUserDialog
                  user={user}
                  trigger={
                    <Button variant="ghost" size="icon-sm" title="Excluir">
                      <IconTrash size={14} className="text-destructive" />
                    </Button>
                  }
                />
              )}
            </div>
          ))}
          {!isLoading && users?.length === 0 && (
            <p className="p-2 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
