"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function InadimplentesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result } = await supabase.from("mensalidades")
          .select("valor, status, vencimento, user:user_id(nome_completo, email, cpf)")
          .in("status", ["Pendente", "Em atraso"])
          .order("vencimento");
        setData(result || []);
      } catch (error) {
        console.error("Erro ao carregar inadimplentes:", error);
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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Inadimplentes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Mensalistas com débitos pendentes</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-neutral-900">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <AlertTriangle size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Nenhum mensalista inadimplente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-850">
            {data.map((d, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{(d.user as any)?.nome_completo || "Desconhecido"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vencimento: {new Date(d.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end gap-1">
                  <p className="font-bold text-sm text-red-600 dark:text-red-400">R$ {parseFloat(d.valor).toFixed(2).replace('.', ',')}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${d.status === 'Em atraso' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
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
