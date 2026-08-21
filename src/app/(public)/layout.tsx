import { Header } from '@/components/common/Header/Header';
import { Footer } from '@/components/common/Footer/Footer';
import { getSession } from '@/lib/auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isLoggedIn = !!session;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} />
      <main>{children}</main>
      <Footer isLoggedIn={isLoggedIn} />
    </>
  );
}
