'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, User, LogOut, Coins } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-text-primary transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cta">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span>Productify</span>
        </Link>

        <nav className="flex items-center gap-6">
          {session ? (
            <>
              <Link
                href="/products"
                className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:block"
              >
                Meus Produtos
              </Link>
              <Link
                href="/generate"
                className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary md:block"
              >
                Criar
              </Link>

              {/* Credits Badge */}
              <Link
                href="/credits"
                className="flex items-center gap-2 rounded-lg border border-border bg-background-tertiary px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:border-primary-500/50"
              >
                <Coins className="h-4 w-4 text-primary-400" />
                <span>{session.user.credits || 0}</span>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-tertiary text-text-primary transition-colors hover:border-primary-500/50"
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-border bg-background-tertiary p-2 shadow-card">
                      <div className="border-b border-border px-3 py-2">
                        <p className="text-sm font-medium text-text-primary">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-glow-primary"
              >
                Começar grátis
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
