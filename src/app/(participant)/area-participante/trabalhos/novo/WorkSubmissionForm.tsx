'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { submitWork } from '@/actions/works';
import styles from './page.module.css';

interface Author {
  name: string;
  email: string;
  institution: string;
  isCorresponding: boolean;
}

const THEMATIC_AREAS = [
  'Cirurgia e Traumatologia Buco-Maxilo-Facial',
  'Dentística',
  'Endodontia',
  'Odontopediatria',
  'Ortodontia',
  'Periodontia',
  'Prótese Dentária',
  'Saúde Coletiva',
  'Radiologia e Imaginologia',
  'Patologia e Estomatologia'
];

export function WorkSubmissionForm({ participantId }: { participantId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  
  const [authors, setAuthors] = useState<Author[]>([
    { name: '', email: '', institution: '', isCorresponding: true }
  ]);
  
  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', institution: '', isCorresponding: false }]);
  };
  
  const removeAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    // If we removed the corresponding author, make the first one corresponding
    if (authors[index].isCorresponding && newAuthors.length > 0) {
      newAuthors[0].isCorresponding = true;
    }
    setAuthors(newAuthors);
  };
  
  const updateAuthor = (index: number, field: keyof Author, value: string | boolean) => {
    const newAuthors = [...authors];
    
    if (field === 'isCorresponding' && value === true) {
      // Uncheck all others
      newAuthors.forEach(a => a.isCorresponding = false);
    }
    
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);
    formData.append('authors', JSON.stringify(authors));
    
    const file = formData.get('file') as File;
    if (file && file.size > 10 * 1024 * 1024) {
      setError('O arquivo excede o limite de 10MB.');
      return;
    }
    
    startTransition(async () => {
      const result = await submitWork(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorAlert}>{error}</div>}
      
      {/* Basic Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Dados do Trabalho</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Título do Trabalho *</label>
          <input type="text" name="title" className={styles.input} required />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Resumo (Abstract) *</label>
          <textarea name="abstract" className={styles.textarea} required></textarea>
        </div>
        
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Área Temática *</label>
            <select name="categoryArea" className={styles.select} required defaultValue="">
              <option value="" disabled>Selecione uma área...</option>
              {THEMATIC_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Modalidade *</label>
            <select name="modality" className={styles.select} required defaultValue="">
              <option value="" disabled>Selecione a modalidade...</option>
              <option value="Painel Científico (Pôster)">Painel Científico (Pôster)</option>
              <option value="Apresentação Oral">Apresentação Oral</option>
              <option value="Mesa Demonstrativa">Mesa Demonstrativa</option>
            </select>
          </div>
        </div>
        
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Orientador *</label>
            <input type="text" name="advisor" className={styles.input} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Apresentador *</label>
            <input type="text" name="presenter" className={styles.input} required />
          </div>
        </div>
      </div>
      
      {/* Authors */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>2. Autores</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Adicione todos os autores do trabalho. Selecione qual deles é o autor correspondente.
        </p>
        
        <div className={styles.authorsList}>
          {authors.map((author, index) => (
            <div key={index} className={styles.authorCard}>
              {authors.length > 1 && (
                <button type="button" onClick={() => removeAuthor(index)} className={styles.removeAuthorBtn}>
                  Remover
                </button>
              )}
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nome Completo *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={author.name}
                    onChange={(e) => updateAuthor(index, 'name', e.target.value)}
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>E-mail *</label>
                  <input 
                    type="email" 
                    className={styles.input} 
                    value={author.email}
                    onChange={(e) => updateAuthor(index, 'email', e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Instituição *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={author.institution}
                    onChange={(e) => updateAuthor(index, 'institution', e.target.value)}
                    required 
                  />
                </div>
                
                <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
                  <label className={styles.radioGroup}>
                    <input 
                      type="radio" 
                      name="isCorresponding" 
                      checked={author.isCorresponding}
                      onChange={() => updateAuthor(index, 'isCorresponding', true)}
                    />
                    Autor Correspondente
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button variant="outline" type="button" onClick={addAuthor}>
            + Adicionar Autor
          </Button>
        </div>
      </div>
      
      {/* File Upload */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>3. Arquivo do Trabalho</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Anexar PDF (Máx. 10MB) *</label>
          <input 
            type="file" 
            name="file" 
            accept=".pdf"
            className={styles.fileInput}
            required 
          />
        </div>
      </div>
      
      <div className={styles.actions}>
        <Button variant="primary" size="lg" type="submit" loading={isPending}>
          Submeter Trabalho
        </Button>
      </div>
    </form>
  );
}
