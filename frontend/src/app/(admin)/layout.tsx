"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CheckSquare, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Painel", icon: LayoutDashboard },
    { href: "/admin/baixa", label: "Baixa Manual", icon: CheckSquare },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-neutral-950 pb-20">
      <header className="bg-red-700 text-white p-4 shadow-md sticky top-0 z-40 flex justify-between items-center">
        <h1 className="font-bold text-lg tracking-wider">RED PARK ADMIN</h1>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/clientes/login';
          }}
          className="text-white/80 hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-around p-3 pb-safe-area-inset-bottom z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-20 h-12 gap-1 rounded-xl transition-colors",
                isActive 
                  ? "text-red-600" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
