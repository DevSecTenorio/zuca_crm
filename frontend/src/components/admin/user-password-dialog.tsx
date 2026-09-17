'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangeUserPassword } from '@/hooks/useUsers';
import type { OrgUser } from '@/api/users';

const schema = z.object({
  newPassword: z.string().min(8, 'Mínimo de 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function UserPasswordDialog({ user, trigger }: { user: OrgUser; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const changePassword = useChangeUserPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) reset({ newPassword: '' });
  }, [open, reset]);

  const onSubmit = (values: FormValues) => {
    changePassword.mutate(
      { id: user.id, newPassword: values.newPassword },
      { onSuccess: () => setOpen(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trocar senha de &quot;{user.name}&quot;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input id="new-password" type="password" {...register('newPassword')} />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Salvando...' : 'Alterar senha'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
