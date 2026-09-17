'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
  orgName: z.string().min(2, 'Informe o nome da organização'),
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('Informe um email válido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = (values: FormValues) => {
    registerUser.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Criar sua organização</CardTitle>
        <CardDescription>Comece a usar o CRM Seu Zuca em menos de 30 segundos</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orgName">Nome da organização</Label>
            <Input id="orgName" placeholder="Minha Empresa Ltda" {...register('orgName')} />
            {errors.orgName && (
              <p className="text-sm text-destructive">{errors.orgName.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Seu nome</Label>
            <Input id="name" placeholder="João Silva" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="voce@empresa.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          {registerUser.isError && (
            <p className="text-sm text-destructive">Não foi possível criar a conta. Tente outro email.</p>
          )}
          <Button type="submit" disabled={registerUser.isPending} className="mt-2">
            {registerUser.isPending ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="font-medium text-foreground underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
