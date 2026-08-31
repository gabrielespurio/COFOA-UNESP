'use client';

import React from 'react';
import Image from 'next/image';
import styles from './OrganizationSection.module.css';

const PROFESSORS = [
  { name: 'Prof. Dr. André Luís da Silva Fabris', file: 'Prof. Dr. André Luís da Silva Fabris.jpeg' },
  { name: 'Prof. Dr. Francisley Ávila Souza', file: 'Prof. Dr. Francisley Ávila Souza.jpeg' },
  { name: 'Prof. Dr. Idelmo Rangel Garcia Júnior', file: 'Prof. Dr. Idelmo Rangel Garcia Júnior.jpeg' },
  { name: 'Prof. Dr. Osvaldo Magro Filho', file: 'Prof. Dr. Osvaldo Magro Filho.jpeg' },
  { name: 'Profa. Dra. Alessandra Aranega', file: 'Profa. Dra. Alessandra Aranega.jpeg' },
  { name: 'Profa. Dra. Ana Paula Farnezi Bassi', file: 'Profa. Dra. Ana Paula Farnezi Bassi.jpeg' },
  { name: 'Profa. Dra. Daniela Ponzoni', file: 'Profa. Dra. Daniela Ponzoni.jpeg' },
];

export function OrganizationSection() {
  return (
    <div className={styles.orgWrapper}>
      <div className={styles.professorsGrid}>
        {PROFESSORS.map((prof, idx) => (
          <div key={idx} className={styles.professorCard}>
            <div className={styles.imageWrapper}>
              <Image 
                src={`/images/professores/${prof.file}`} 
                alt={prof.name} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.professorImage}
              />
            </div>
            <div className={styles.professorInfo}>
              <h4 className={styles.professorName}>{prof.name}</h4>
              <p className={styles.professorRole}>Professor(a)</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
