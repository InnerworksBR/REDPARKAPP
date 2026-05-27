"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function MensalistasPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profiles } = await supabase.from("profiles").select("nome_completo, email, cpf").eq("role", "mensalista").order("nome_completo");
        setData(profiles || []);
      } catch (error) {
        console.error("Erro ao carregar mensalistas:", error);
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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Mensalistas Ativos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Lista de todos os clientes cadastrados</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-neutral-900">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Users size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Nenhum mensalista encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-850">
            {data.map((d, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-gray-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{d.nome_completo}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">CPF: {d.cpf}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
