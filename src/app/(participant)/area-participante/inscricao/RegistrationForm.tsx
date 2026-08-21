'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { createRegistration } from '@/actions/participant';
import styles from './page.module.css';

interface Category {
  id: string;
  name: string;
  priceTier: string;
  requiresStudentProof: boolean;
  requiresCRO: boolean;
}

interface RegistrationFormProps {
  categories: Category[];
  participantId: string;
}

export function RegistrationForm({ categories, participantId }: RegistrationFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const activeCategory = categories.find(c => c.id === selectedCategory);
  const needsUpload = activeCategory?.requiresStudentProof || activeCategory?.requiresCRO;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCategory) {
      setError('Por favor, selecione uma categoria.');
      return;
    }

    if (needsUpload && !file) {
      setError('Por favor, anexe o comprovante obrigatório para esta categoria.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('categoryId', selectedCategory);
      if (needsUpload && file) {
        formData.append('file', file);
      }

      // Call Server Action
      const result = await createRegistration(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.categoryList}>
        {categories.map((cat) => (
          <label 
            key={cat.id} 
            className={`${styles.categoryCard} ${selectedCategory === cat.id ? styles.selected : ''}`}
          >
            <input 
              type="radio" 
              name="category" 
              value={cat.id}
              checked={selectedCategory === cat.id}
              onChange={() => setSelectedCategory(cat.id)}
              className={styles.radioInput}
            />
            <div className={styles.cardContent}>
              <h4 className={styles.categoryName}>{cat.name}</h4>
              <p className={styles.categoryReqs}>
                {cat.requiresStudentProof && 'Exige Comprovante de Matrícula'}
                {cat.requiresCRO && 'Exige CRO Ativo'}
                {!cat.requiresStudentProof && !cat.requiresCRO && 'Sem exigência de comprovantes'}
              </p>
            </div>
          </label>
        ))}
      </div>

      {needsUpload && (
        <div className={styles.uploadSection}>
          <label className={styles.label}>
            Anexar Comprovante (PDF, JPG, PNG) *
          </label>
          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={styles.fileInput}
            required
          />
          <p className={styles.hint}>O arquivo será salvo com segurança em nuvem.</p>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" size="lg" type="submit" loading={isPending} disabled={!selectedCategory}>
          Confirmar e Prosseguir
        </Button>
      </div>
    </form>
  );
}
