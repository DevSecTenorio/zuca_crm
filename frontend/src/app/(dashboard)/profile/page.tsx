'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useOwnProfile, useUpdateOwnProfile, useChangeOwnPassword } from '@/hooks/useProfile';
import { getInitials, formatDate } from '@/lib/format';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  rep: 'Vendedor',
};

const profileSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(8, 'A nova senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: profile, isLoading } = useOwnProfile();
  const updateProfile = useUpdateOwnProfile();
  const changePassword = useChangeOwnPassword();

  const [editingName, setEditingName] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile) resetProfile({ name: profile.name });
  }, [profile, resetProfile]);

  const onSubmitProfile = (values: ProfileValues) => {
    updateProfile.mutate(values.name, { onSuccess: () => setEditingName(false) });
  };

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmitPassword = (values: PasswordValues) => {
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => resetPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
    );
  };

  if (isLoading || !profile) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div>
      <PageHeader title="Meu Perfil" description="Gerencie suas informações pessoais e senha" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações pessoais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                {getInitials(profile.name)}
              </div>
              <div>
                <p className="font-medium">{profile.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{ROLE_LABELS[profile.role] ?? profile.role}</Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-name">Nome</Label>
                <Input
                  id="profile-name"
                  {...registerProfile('name')}
                  onFocus={() => setEditingName(true)}
                />
                {profileErrors.name && (
                  <p className="text-sm text-destructive">{profileErrors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={profile.email} disabled />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado por aqui.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>Membro desde {formatDate(profile.createdAt)}</span>
              </div>

              {editingName && (
                <Button type="submit" disabled={updateProfile.isPending} className="w-fit">
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alterar senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  {...registerPassword('currentPassword')}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" {...registerPassword('newPassword')} />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  {...registerPassword('confirmPassword')}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={changePassword.isPending} className="w-fit">
                {changePassword.isPending ? 'Alterando...' : 'Alterar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
