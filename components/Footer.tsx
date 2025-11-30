import Link from 'next/link';
import { Sparkles, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-xl font-bold text-text-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-cta">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span>Productify</span>
            </Link>
            <p className="mb-4 text-sm text-text-secondary">
              Transforme fotos em conteúdo viral com IA. Rápido, fácil e
              profissional.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-tertiary text-text-secondary transition-colors hover:border-primary-500 hover:text-primary-400"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-tertiary text-text-secondary transition-colors hover:border-primary-500 hover:text-primary-400"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background-tertiary text-text-secondary transition-colors hover:border-primary-500 hover:text-primary-400"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Produto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/generate"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Criar conteúdo
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Meus produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/credits"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Créditos
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-text-secondary transition-colors hover:text-text-primary"
                >
                  Termos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-text-tertiary">
            © 2025 Productify. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
