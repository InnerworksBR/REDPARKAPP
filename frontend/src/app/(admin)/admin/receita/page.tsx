"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function ReceitaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        
        const { data: pendentes } = await supabase.from("mensalidades")
          .select("valor, status, vencimento, user:user_id(nome_completo)")
          .gte("vencimento", firstDay).lte("vencimento", lastDay).neq("status", "Pago");
          
        const { data: pagas } = await supabase.from("transacoes")
          .select("valor, status, data_pagamento, mensalidade:mensalidade_id(user:user_id(nome_completo))")
          .gte("data_pagamento", firstDay + "T00:00:00Z").lte("data_pagamento", lastDay + "T23:59:59Z").eq("status", "Aprovado");
          
        const formattedPendentes = (pendentes || []).map(p => ({
          nome: (p.user as any)?.nome_completo || "Desconhecido",
          valor: p.valor,
          status: p.status,
          data: p.vencimento
        }));
        
        const formattedPagas = (pagas || []).map(p => ({
          nome: (p.mensalidade as any)?.user?.nome_completo || "Desconhecido",
          valor: p.valor,
          status: "Pago",
          data: p.data_pagamento.split('T')[0]
        }));
        
        setData([...formattedPendentes, ...formattedPagas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      } catch (error) {
        console.error("Erro ao carregar receita prevista:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/admin/dashboard')} className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors">
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Receita Prevista</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Valores pagos e pendentes do mês atual</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-neutral-900">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <TrendingUp size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Nenhum dado encontrado para este mês</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-850">
            {data.map((d, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{d.nome}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {d.status === "Pago" ? "Pago em" : "Vence em"} {new Date(d.data + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end gap-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">R$ {parseFloat(d.valor).toFixed(2).replace('.', ',')}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${d.status === 'Pago' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : d.status === 'Em atraso' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {d.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
