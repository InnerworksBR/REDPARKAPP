"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CreditCard, QrCode } from "lucide-react";
import { cn } from "@/utils/cn";

export default function MensalistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/pagamento", label: "Pagar", icon: CreditCard },
    { href: "/checkin", label: "Check-in", icon: QrCode },
  ];

  return (
    <div className="flex flex-col flex-1 h-full pb-20 relative">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-around p-3 pb-safe-area-inset-bottom z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-none sm:border-x">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-colors",
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
