import { Metadata } from 'next';
import { SectionHeading } from '@/components/ui/SectionHeading/SectionHeading';
import { getBatches } from '@/actions/adminBatches';
import { LotesClient } from './LotesClient';

export const metadata: Metadata = {
  title: 'Lotes de Inscrição',
};

export default async function AdminLotesPage() {
  const batches = await getBatches();

  return (
    <div>
      <SectionHeading title="Lotes de Inscrição" />
      <div style={{ marginTop: '2rem' }}>
        <LotesClient initialBatches={batches} />
      </div>
    </div>
  );
}
