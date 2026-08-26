'use server';

import { prisma } from '@/lib/prisma';
import { createSession, destroySession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
  redirectTo: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres.')
    .max(100, 'A senha é muito longa (máximo 100 caracteres).'),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, redirectTo } = result.data;

  let redirectToFinal = '';

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Credenciais inválidas.' };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return { error: 'Por segurança sua conta foi bloqueada devido a muitas tentativas inválidas. Clique em "Esqueci minha senha" para recuperar o acesso.' };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      const newAttempts = user.failedLoginAttempts + 1;
      if (newAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // block for 24 hours
          }
        });
        return { error: 'Conta bloqueada por muitas tentativas. Clique em "Esqueci minha senha" para recuperar.' };
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: newAttempts }
      });
      return { error: 'Credenciais inválidas.' };
    }

    // Reset failed attempts if successful
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null }
      });
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Determine redirect based on role
    let defaultRedirect = '/area-participante';
    if (user.role === 'ADMIN') defaultRedirect = '/admin';
    if (user.role === 'COMMITTEE') defaultRedirect = '/comissao';
    
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
  const result = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;

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

const requestResetSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const result = requestResetSchema.safeParse({ email: formData.get('email') });
  
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }
  
  const email = result.data.email;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if not found to prevent email enumeration
      return { success: true, email };
    }
    
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: code,
        passwordResetExpires: expiresAt
      }
    });
    
    await sendPasswordResetEmail(email, code);
    
    return { success: true, email };
  } catch (error) {
    console.error('Password reset request error:', error);
    return { error: 'Ocorreu um erro ao processar a solicitação.' };
  }
}

const resetPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  code: z.string().length(6, 'O código deve ter 6 dígitos.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export async function resetPassword(prevState: any, formData: FormData) {
  const result = resetPasswordSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
    password: formData.get('password'),
  });
  
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }
  
  const { email, code, password } = result.data;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.passwordResetCode !== code || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return { error: 'Código inválido ou expirado. Solicite novamente.' };
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetCode: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Ocorreu um erro ao redefinir a senha.' };
  }
}

export async function googleLogin(token: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return { error: 'Credenciais do Google inválidas.' };
    }
    
    const email = payload.email;
    const googleId = payload.sub; // Google's unique identifier for the user
    
    // Find existing user by googleId or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email }
        ]
      }
    });
    
    if (user) {
      // If user exists but doesn't have googleId linked, link it now
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }
      
      // If user is locked, checking if we want to allow Google to bypass or not
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        // Unlock them since Google verified their identity securely
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null }
        });
      }
    } else {
      // User doesn't exist, create a new one (without a password)
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          // No passwordHash provided as it's now optional
        }
      });
    }
    
    // Create session cookie just like regular login
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Google login error:', error);
    return { error: 'Ocorreu um erro ao processar o login com o Google.' };
  }
}
