'use client';

import React from 'react';
import Image from 'next/image';
import styles from './OrganizationSection.module.css';

const PROFESSORS = [
  { name: 'Prof. Dr. André Luís da Silva Fabris', file: 'Prof. Dr. André Luís da Silva Fabris.png' },
  { name: 'Prof. Dr. Francisley Ávila Souza', file: 'Prof. Dr. Francisley Ávila Souza.png' },
  { name: 'Prof. Dr. Idelmo Rangel Garcia Júnior', file: 'Prof. Dr. Idelmo Rangel Garcia Júnior.png' },
  { name: 'Prof. Dr. Osvaldo Magro Filho', file: 'Prof. Dr. Osvaldo Magro Filho.png' },
  { name: 'Profa. Dra. Alessandra Aranega', file: 'Profa. Dra. Alessandra Aranega.png' },
  { name: 'Profa. Dra. Ana Paula Farnezi Bassi', file: 'Profa. Dra. Ana Paula Farnezi Bassi.png' },
  { name: 'Profa. Dra. Daniela Ponzoni', file: 'Profa. Dra. Daniela Ponzoni.png' },
];

export function OrganizationSection() {
  return (
    <div className={styles.orgWrapper}>
      <div className={styles.professorsGrid}>
        {PROFESSORS.map((prof, idx) => (
          <div key={idx} className={styles.professorItem}>
            <div className={styles.imageWrapper}>
              <div className={styles.imageInner}>
                <Image 
                  src={`/images/professores_nobg/${prof.file}`} 
                  alt={prof.name} 
                  fill 
                  sizes="160px"
                  className={styles.professorImage}
                />
              </div>
            </div>
            <div className={styles.professorInfo}>
              <h4 className={styles.professorName}>{prof.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
