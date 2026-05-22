"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Car, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Mensalistas",
      value: "142",
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      title: "Receita Prevista",
      value: "R$ 35.500",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      title: "Inadimplentes",
      value: "12",
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Visão Geral</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 flex flex-col items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Últimas Atividades</h2>
      
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between bg-white dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                  {['JD', 'MA', 'RS'][i]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {['João Dias', 'Maria Alves', 'Roberto Silva'][i]}
                  </p>
                  <p className="text-xs text-gray-500">
                    Pagamento aprovado
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Há {i+1}h</span>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
