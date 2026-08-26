'use client';

import React, { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { updateProfile } from '@/actions/participant';
import styles from './page.module.css';

interface ProfileFormProps {
  initialData?: {
    fullName: string;
    cpf: string;
    phone: string | null;
    birthDate: Date | string | null;
    institution: string | null;
    city: string | null;
    state: string | null;
    course: string | null;
  } | null;
}

const formatCPF = (value: string | null | undefined) => {
  if (!value) return '';
  let v = value.replace(/\D/g, '').substring(0, 11);
  if (v.length > 9) {
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (v.length > 6) {
    return v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (v.length > 3) {
    return v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return v;
};

const formatPhone = (value: string | null | undefined) => {
  if (!value) return '';
  let v = value.replace(/\D/g, '').substring(0, 11);
  if (v.length > 10) {
    return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (v.length > 6) {
    return v.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  } else if (v.length > 2) {
    return v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
  }
  return v;
};

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  
  const [cpf, setCpf] = useState(formatCPF(initialData?.cpf));
  const [phone, setPhone] = useState(formatPhone(initialData?.phone));

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  let defaultBirthDate = '';
  if (initialData?.birthDate) {
    try {
      const d = new Date(initialData.birthDate);
      if (!isNaN(d.getTime())) {
        defaultBirthDate = d.toISOString().split('T')[0];
      }
    } catch (err) {}
  }

  return (
    <form className={styles.form} action={formAction}>
      {state?.error && (
        <div className={styles.errorAlert}>
          {state.error}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="fullName">Nome Completo *</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName"
            className={styles.input} 
            defaultValue={initialData?.fullName || ''}
            required 
          />
        </div>
        
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cpf">CPF *</label>
          <input 
            type="text" 
            id="cpf" 
            name="cpf"
            className={styles.input} 
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            required 
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="birthDate">Data de Nascimento *</label>
          <input 
            type="date" 
            id="birthDate" 
            name="birthDate"
            className={styles.input} 
            defaultValue={defaultBirthDate}
            required 
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Celular *</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone"
            className={styles.input} 
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            required 
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="institution">Instituição de Ensino / Trabalho</label>
          <input 
            type="text" 
            id="institution" 
            name="institution"
            className={styles.input} 
            defaultValue={initialData?.institution || ''}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="course">Curso (se estudante)</label>
          <input 
            type="text" 
            id="course" 
            name="course"
            className={styles.input} 
            defaultValue={initialData?.course || ''}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="city">Cidade</label>
          <input 
            type="text" 
            id="city" 
            name="city"
            className={styles.input} 
            defaultValue={initialData?.city || ''}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="state">Estado</label>
          <select 
            id="state" 
            name="state"
            className={styles.input} 
            defaultValue={initialData?.state || ''}
          >
            <option value="">Selecione...</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="MG">Minas Gerais</option>
            <option value="PR">Paraná</option>
            {/* Add more states as needed or just use a text input, but select is better */}
            <option value="OUTRO">Outro</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" size="lg" type="submit" loading={isPending}>
          Salvar Perfil
        </Button>
      </div>
    </form>
  );
}
