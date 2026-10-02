'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  token: string;
  size?: number;
}

export function QrCodeDisplay({ token, size = 200 }: QrCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(token, {
      width: size,
      margin: 2,
      color: {
        dark: '#1B2D5B',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl).catch(console.error);
  }, [token, size]);

  if (!dataUrl) {
    return (
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-sm)',
      }}>
        Gerando...
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }}
    />
  );
}
