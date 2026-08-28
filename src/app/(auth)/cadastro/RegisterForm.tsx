'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { Button } from '@/components/ui/Button/Button';
import { register } from '@/actions/auth';
import styles from './page.module.css';

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Crie sua Conta</h1>
        <p className={styles.subtitle}>Preencha os dados abaixo para iniciar sua inscrição no XV COFOA.</p>
      </div>
      <GoogleAuthButton />
      <form className={styles.form} action={formAction}>
        {state?.error && (
          <div className={styles.errorAlert}>
            {state.error}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            className={styles.input} 
            placeholder="seu@email.com" 
            required
            autoComplete="email"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Senha</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            className={styles.input} 
            placeholder="Mínimo 6 caracteres" 
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <Button variant="primary" size="lg" type="submit" loading={isPending} fullWidth>
          Criar Conta
        </Button>
      </form>
      <div className={styles.footer}>
        Já tem uma conta? <Link href="/login" className={styles.link}>Faça login</Link>
      </div>
    </div>
  );
}
