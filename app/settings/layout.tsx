import { SettingsSidebar } from '@/components/SettingsSidebar';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="container mx-auto flex-1 px-4 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Configurações
            </h1>
            <p className="text-text-secondary">
              Gerencie sua conta, créditos e preferências
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <SettingsSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
