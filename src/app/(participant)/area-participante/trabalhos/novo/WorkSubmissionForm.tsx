'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { submitWork, resubmitWork } from '@/actions/works';
import { generateUploadUrls } from '@/actions/upload';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

interface Author {
  name: string;
  email: string;
  institution: string;
  isCorresponding: boolean;
}

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

const MODALITIES = [
  'Caso clínico - ONLINE - ORAL - Nível de Graduação',
  'Caso clínico - ONLINE - ORAL - Nível de Pós-graduação',
  'Caso clínico - ONLINE - PAINEL - Nível de Graduação',
  'Caso clínico - ONLINE - PAINEL - Nível de Pós-graduação',
  'Caso clínico - PRESENCIAL - ORAL - Nível de Graduação',
  'Caso clínico - PRESENCIAL - ORAL - Nível de Pós-graduação',
  'Caso clínico - PRESENCIAL - PAINEL - Nível de Pós-graduação',
  'Caso clínico - PRESENCIAL - PAINEL - Nível de Graduação',
  'Pesquisa científica - ONLINE - ORAL - Nível de Graduação',
  'Pesquisa científica - ONLINE - ORAL - Nível de Pós-graduação',
  'Pesquisa científica - ONLINE - PAINEL - Nível de Graduação',
  'Pesquisa científica - ONLINE - PAINEL - Nível de Pós-graduação',
  'Pesquisa científica - PRESENCIAL - PAINEL - Nível de Graduação',
  'Pesquisa científica - PRESENCIAL - ORAL - Nível de Graduação',
  'Pesquisa científica - PRESENCIAL - ORAL - Nível de Pós-graduação',
  'Pesquisa científica - PRESENCIAL - PAINEL - Nível de Pós-graduação',
  'Projeto de Extensão - PAINEL EXPOSTO - PRESENCIAL'
];

export function WorkSubmissionForm({ participantId, initialData, workId }: { participantId: string, initialData?: any, workId?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!initialData;

  const [authors, setAuthors] = useState<Author[]>(
    initialData?.authors 
      ? (typeof initialData.authors === 'string' ? JSON.parse(initialData.authors) : initialData.authors)
      : [{ name: '', email: '', institution: '', isCorresponding: true }]
  );
  
  const [requiresEthics, setRequiresEthics] = useState<boolean>(initialData?.requiresEthics || false);
  
  const addAuthor = () => {
    setAuthors([...authors, { name: '', email: '', institution: '', isCorresponding: false }]);
  };
  
  const removeAuthor = (index: number) => {
    const newAuthors = [...authors];
    newAuthors.splice(index, 1);
    if (authors[index].isCorresponding && newAuthors.length > 0) {
      newAuthors[0].isCorresponding = true;
    }
    setAuthors(newAuthors);
  };
  
  const updateAuthor = (index: number, field: keyof Author, value: string | boolean) => {
    const newAuthors = [...authors];
    
    if (field === 'isCorresponding' && value === true) {
      newAuthors.forEach(a => a.isCorresponding = false);
    }
    
    newAuthors[index] = { ...newAuthors[index], [field]: value };
    setAuthors(newAuthors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('authors', JSON.stringify(authors));
    formData.append('requiresEthics', requiresEthics ? 'true' : 'false');
    if (workId) {
      formData.append('workId', workId);
    }
    
    const checkFile = (name: string) => {
      const file = formData.get(name) as File;
      if (file && file.size > 12 * 1024 * 1024) {
        return true;
      }
      return false;
    }

    if (checkFile('identifiedFile') || checkFile('unidentifiedFile') || checkFile('enrollmentProof')) {
      setError('Um ou mais arquivos excedem o limite de 10MB.');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const filesToUpload: { suffix: string, fileExt: string, file: File, name: string }[] = [];
      
      const prepareFile = (name: string, suffix: string) => {
        const file = formData.get(name) as File | null;
        if (file && file.size > 0) {
          const fileExt = file.name.split('.').pop() || 'pdf';
          filesToUpload.push({ suffix, fileExt, file, name });
        }
      }

      prepareFile('identifiedFile', 'id');
      prepareFile('unidentifiedFile', 'unid');
      prepareFile('enrollmentProof', 'proof');
      if (requiresEthics) {
        prepareFile('ethicsCommitteeFile', 'ethics');
      }

      if (filesToUpload.length > 0) {
        const { urls, error: urlError } = await generateUploadUrls(filesToUpload.map(f => ({ suffix: f.suffix, fileExt: f.fileExt })));
        
        if (urlError || !urls) {
          throw new Error(urlError || 'Falha ao gerar links de upload seguros.');
        }

        for (const fileObj of filesToUpload) {
          const urlInfo = urls.find(u => u.suffix === fileObj.suffix);
          if (!urlInfo) throw new Error('Informações de upload incompletas.');

          const { error: uploadError } = await supabase.storage
            .from('trabalhos')
            .uploadToSignedUrl(urlInfo.filePath, urlInfo.token, fileObj.file, {
               upsert: true
            });
            
          if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error(`Falha ao enviar arquivo. O arquivo pode ser grande demais ou a rede oscilou.`);
          }
          
          const { data: publicUrlData } = supabase.storage.from('trabalhos').getPublicUrl(urlInfo.filePath);
          formData.set(fileObj.name + 'Url', publicUrlData.publicUrl);
        }
      }
      
      // Remove the physical files to prevent exceeding server body limits
      formData.delete('identifiedFile');
      formData.delete('unidentifiedFile');
      formData.delete('enrollmentProof');
      formData.delete('ethicsCommitteeFile');

      // Submit the lightweight form to the server action
      const result = isEditing ? await resubmitWork(formData) : await submitWork(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err: any) {
      console.error('Upload process failed:', err);
      setError(err.message || 'Erro no envio. Verifique sua conexão e o tamanho dos arquivos.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.errorAlert}>{error}</div>}
      
      {/* Basic Info */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>1. Dados do Trabalho</h3>
        
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-surface-alt)', borderLeft: '4px solid var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
            Antes de submeter, é obrigatória a leitura atenta das regras de submissão. <br/>
            <a href="/Edital finalizado.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'underline' }}>
              Clique aqui para acessar o Edital
            </a>.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Título do Trabalho *</label>
          <input type="text" name="title" className={styles.input} required defaultValue={initialData?.title || ''} />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Resumo *</label>
          <textarea name="abstract" className={styles.textarea} required defaultValue={initialData?.abstract || ''}></textarea>
        </div>
        
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Área Temática *</label>
            <select name="categoryArea" className={styles.select} required defaultValue={initialData?.categoryArea || ""}>
              <option value="" disabled>Selecione uma área...</option>
              {THEMATIC_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Modalidade *</label>
            <select name="modality" className={styles.select} required defaultValue={initialData?.modality || ""}>
              <option value="" disabled>Selecione a modalidade...</option>
              {MODALITIES.map(modality => (
                <option key={modality} value={modality}>{modality}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Orientador *</label>
            <input type="text" name="advisor" className={styles.input} required defaultValue={initialData?.advisor || ''} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Apresentador *</label>
            <input type="text" name="presenter" className={styles.input} required defaultValue={initialData?.presenter || ''} />
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
        <h3 className={styles.sectionTitle}>3. Arquivos do Trabalho</h3>
        {isEditing && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', marginBottom: '1rem' }}>
            Atenção: Como você está corrigindo um trabalho, só envie os arquivos caso precise atualizá-los. Se não anexar um arquivo novo, o anterior será mantido.
          </p>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Para esse trabalho, se aplica trabalho de ética? *</label>
          <select 
            className={styles.input} 
            value={requiresEthics ? "sim" : "nao"} 
            onChange={(e) => setRequiresEthics(e.target.value === 'sim')}
            required
          >
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>

        {requiresEthics && (
          <div className={styles.formGroup}>
            <label className={styles.label}>COMITE DE ETICA (PDF - Máx. 10MB) {!isEditing && '*'}</label>
            <input 
              type="file" 
              name="ethicsCommitteeFile" 
              accept=".pdf"
              className={styles.fileInput}
              required={!isEditing} 
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Trabalho Identificado (PDF - Máx. 10MB) {!isEditing && '*'}</label>
          <input 
            type="file" 
            name="identifiedFile" 
            accept=".pdf"
            className={styles.fileInput}
            required={!isEditing} 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Trabalho Não Identificado (PDF - Máx. 10MB) {!isEditing && '*'}</label>
          <input 
            type="file" 
            name="unidentifiedFile" 
            accept=".pdf"
            className={styles.fileInput}
            required={!isEditing} 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Comprovante de Matrícula (PDF - Máx. 10MB) {!isEditing && '*'}</label>
          <input 
            type="file" 
            name="enrollmentProof" 
            accept=".pdf"
            className={styles.fileInput}
            required={!isEditing} 
          />
        </div>
      </div>
      
      <div className={styles.actions}>
        <Button variant="primary" size="lg" type="submit" loading={isUploading}>
          {isEditing ? 'Reenviar Trabalho' : 'Submeter Trabalho'}
        </Button>
      </div>
    </form>
  );
}
