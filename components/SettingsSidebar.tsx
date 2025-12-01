'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coins,
  Users,
  User,
  Activity,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const navItems: NavItem[] = [
  {
    href: '/settings/credits',
    label: 'Créditos',
    icon: Coins,
    description: 'Gerenciar créditos e histórico',
  },
  {
    href: '/settings/team',
    label: 'Equipe',
    icon: Users,
    description: 'Membros e permissões',
  },
  {
    href: '/settings/account',
    label: 'Conta',
    icon: User,
    description: 'Dados pessoais e preferências',
  },
  {
    href: '/settings/activity',
    label: 'Atividades',
    icon: Activity,
    description: 'Auditoria e logs',
  },
  {
    href: '/settings/security',
    label: 'Segurança',
    icon: Shield,
    description: 'Senha e exclusão de conta',
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary-500/10 text-primary-400 border-l-4 border-primary-500'
                  : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-primary-400' : 'text-text-tertiary group-hover:text-text-secondary'
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-text-tertiary hidden lg:block">
                    {item.description}
                  </span>
                </div>
              </div>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  isActive ? 'text-primary-400' : 'text-text-tertiary opacity-0 group-hover:opacity-100'
                }`}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
