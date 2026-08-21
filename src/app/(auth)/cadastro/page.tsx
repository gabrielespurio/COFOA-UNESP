import { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Criar Conta',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
