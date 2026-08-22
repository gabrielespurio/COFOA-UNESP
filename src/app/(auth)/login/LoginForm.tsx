'use client';

import React, { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { login } from '@/actions/auth';
import styles from './page.module.css';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Acesso ao Sistema</h1>
        <p className={styles.subtitle}>Entre com suas credenciais para continuar.</p>
      </div>
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
            placeholder="••••••••" 
            required
            autoComplete="current-password"
          />
        </div>
        <Button variant="primary" size="lg" type="submit" loading={isPending} fullWidth>
          Entrar
        </Button>
      </form>
      <div className={styles.footer}>
        Ainda não tem conta? <Link href="/cadastro" className={styles.link}>Faça seu cadastro</Link>
      </div>
    </div>
  );
}
