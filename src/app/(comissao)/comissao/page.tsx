import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Comissão Avaliadora | COFOA',
};

export default async function ComissaoPlaceholderPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'COMMITTEE' && session.role !== 'ADMIN') {
    redirect('/area-participante');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center border-t-4 border-purple-600">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Painel do Avaliador</h1>
        <p className="text-gray-600 mb-8">
          O sistema de atribuição e avaliação de trabalhos científicos está atualmente em construção. 
          Em breve você poderá acessar e avaliar os trabalhos por aqui!
        </p>
        
        <Link 
          href="/selecionar-perfil" 
          className="inline-block bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Voltar
        </Link>
      </div>
    </div>
  );
}
