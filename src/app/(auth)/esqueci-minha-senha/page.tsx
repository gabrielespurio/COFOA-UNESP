import { Metadata } from 'next';
import { ResetForm } from './ResetForm';

export const metadata: Metadata = {
  title: 'Recuperar Senha',
};

export default function ResetPasswordPage() {
  return <ResetForm />;
}
