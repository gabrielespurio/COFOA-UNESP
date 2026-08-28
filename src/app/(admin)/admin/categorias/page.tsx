import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { getCategories } from '@/actions/adminCategories';
import { CategoriasClient } from './CategoriasClient';

export const metadata: Metadata = {
  title: 'Categorias',
};

export default async function AdminCategoriasPage() {
  const categories = await getCategories();

  return (
    <div>
      <SectionHeading title="Categorias" />
      <div style={{ marginTop: '2rem' }}>
        <CategoriasClient initialCategories={categories} />
      </div>
    </div>
  );
}
