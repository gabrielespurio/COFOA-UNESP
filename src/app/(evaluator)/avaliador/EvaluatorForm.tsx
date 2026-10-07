'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { saveEvaluatorProfile } from '@/actions/evaluator';
import styles from './EvaluatorForm.module.css';

const THEMATIC_AREAS = [
  'Ciências Básicas (Histologia/Fisiologia/Bioquímica/Anatomia/Microbiologia/Farmacologia)',
  'Cirurgia e Traumatologia Buco-Maxilo-Facial',
  'Dentística / Harmonização Orofacial',
  'Endodontia',
  'Estomatologia / Patologia / Radiologia',
  'Eugênio Zerlotti / Categoria em inglês / Presencial',
  'Odontopediatria / Ortodontia',
  'Pacientes com necessidades especiais / Odontologia hospitalar / Odontogeriatria',
  'Periodontia / Implantodontia',
  'Prótese dentária / Materiais dentários / Oclusão / ATM',
  'Saúde Coletiva / Odontologia Legal'
];

export function EvaluatorForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await saveEvaluatorProfile(formData);
      
      if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label className={styles.label}>Nome Completo *</label>
        <input type="text" name="fullName" className={styles.input} required />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Unidade de Origem *</label>
        <input type="text" name="institution" className={styles.input} required placeholder="Ex: FOA UNESP" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Telefone / WhatsApp *</label>
        <input type="tel" name="phone" className={styles.input} required placeholder="(00) 00000-0000" />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Área que deseja avaliar *</label>
        <select name="area" className={styles.select} required defaultValue="">
          <option value="" disabled>Selecione uma área...</option>
          {THEMATIC_AREAS.map(area => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      <Button variant="primary" type="submit" loading={loading} style={{ marginTop: '1rem' }}>
        Salvar Perfil
      </Button>
    </form>
  );
}
