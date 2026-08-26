'use client';

import React, { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button/Button';
import { requestPasswordReset, resetPassword } from '@/actions/auth';
import styles from '../login/page.module.css';
import { useRouter } from 'next/navigation';

export function ResetForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const router = useRouter();

  // Step 1: Request Code
  const [reqState, reqFormAction, isReqPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await requestPasswordReset(prevState, formData);
    if (res?.success) {
      setEmail(res.email);
      setStep(2);
    }
    return res;
  }, null);

  // Step 2: Reset Password
  const [resetState, resetFormAction, isResetPending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await resetPassword(prevState, formData);
    if (res?.success) {
      alert('Sua senha foi redefinida com sucesso! Você já pode fazer login.');
      router.push('/login');
    }
    return res;
  }, null);

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Recuperar Senha</h1>
        <p className={styles.subtitle}>
          {step === 1 ? 'Insira seu e-mail para receber um código de recuperação.' : 'Verifique seu e-mail e crie uma nova senha.'}
        </p>
      </div>

      {step === 1 ? (
        <form className={styles.form} action={reqFormAction}>
          {reqState?.error && (
            <div className={styles.errorAlert}>
              {reqState.error}
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
            />
          </div>
          <Button variant="primary" size="lg" type="submit" loading={isReqPending} fullWidth>
            Receber Código
          </Button>
        </form>
      ) : (
        <form className={styles.form} action={resetFormAction}>
          {resetState?.error && (
            <div className={styles.errorAlert}>
              {resetState.error}
            </div>
          )}
          <input type="hidden" name="email" value={email} />
          
          <div className={styles.field}>
            <label className={styles.label} htmlFor="code">Código de 6 dígitos</label>
            <input 
              type="text" 
              id="code" 
              name="code"
              className={styles.input} 
              placeholder="000000" 
              required
              maxLength={6}
              pattern="\d{6}"
              style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Nova Senha</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className={styles.input} 
              placeholder="••••••••" 
              required
              minLength={6}
            />
          </div>
          <Button variant="primary" size="lg" type="submit" loading={isResetPending} fullWidth>
            Salvar Nova Senha
          </Button>
        </form>
      )}

      <div className={styles.footer}>
        Lembrou da senha? <Link href="/login" className={styles.link}>Voltar ao login</Link>
      </div>
    </div>
  );
}
