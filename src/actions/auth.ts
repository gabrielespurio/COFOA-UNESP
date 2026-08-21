'use server';

import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string || '/area-participante';

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  let redirectToFinal = '';

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Credenciais inválidas.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return { error: 'Credenciais inválidas.' };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Determine redirect based on role
    const defaultRedirect = user.role === 'ADMIN' ? '/admin' : '/area-participante';
    const finalRedirectTo = formData.get('redirectTo') as string || defaultRedirect;
    
    // Pass to outside try-catch
    redirectToFinal = finalRedirectTo;
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.' };
  }

  // Redirect must be outside the try-catch block because Next.js redirect throws an error internally
  redirect(redirectToFinal);
}

export async function register(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios.' };
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Este e-mail já está em uso.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error('Register error:', error);
    return { error: 'Ocorreu um erro ao criar a conta. Tente novamente mais tarde.' };
  }

  redirect('/area-participante');
}

export async function logout() {
  await destroySession();
  redirect('/login');
}
