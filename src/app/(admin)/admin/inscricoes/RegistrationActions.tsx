'use client';

import React, { useState } from 'react';
import { 
  ManageRegistrationModal, 
  ManageModalCategory, 
  ManageModalParticipant, 
  ManageModalRegistration 
} from './ManageRegistrationModal';

interface RegistrationActionsProps {
  participant: ManageModalParticipant;
  registration: ManageModalRegistration;
  categories: ManageModalCategory[];
}

export function RegistrationActions({ 
  participant, 
  registration, 
  categories 
}: RegistrationActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            padding: '6px 12px', 
            fontSize: '12px', 
            fontWeight: 600,
            background: 'var(--color-primary, #0284c7)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <span>⚙️ Gerenciar</span>
        </button>
      </div>

      <ManageRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        participant={participant}
        registration={registration}
        categories={categories}
      />
    </>
  );
}
