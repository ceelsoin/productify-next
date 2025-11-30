'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-secondary/95 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-start gap-3">
            <Cookie className="mt-1 h-5 w-5 flex-shrink-0 text-primary-400" />
            <div>
              <p className="text-sm text-text-primary">
                <strong>Este site usa cookies</strong>
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Usamos cookies essenciais para autenticação e análise de uso.
                Não vendemos seus dados.{' '}
                <Link
                  href="/privacy"
                  className="text-primary-400 underline hover:text-primary-300"
                >
                  Saiba mais
                </Link>
              </p>
            </div>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-text-tertiary hover:text-text-primary md:flex-initial"
            >
              Recusar
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 rounded-lg bg-gradient-cta px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 md:flex-initial"
            >
              Aceitar cookies
            </button>
            <button
              onClick={handleReject}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-tertiary transition-colors hover:border-text-tertiary hover:text-text-primary"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
