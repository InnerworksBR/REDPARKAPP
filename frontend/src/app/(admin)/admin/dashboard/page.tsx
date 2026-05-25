"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle, Clock, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    mensalistas: 0,
    receitaPrevista: 0,
    inadimplentes: 0,
  });
  const [atividades, setAtividades] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      // 1. Contar mensalistas ativos (role = 'mensalista')
      const { count: countMensalistas, error: errorMensalistas } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "mensalista");

      if (errorMensalistas) throw errorMensalistas;

      // 2. Somar receita prevista para o mês corrente
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

      const { data: mensalidadesMes, error: errorMensalidades } = await supabase
        .from("mensalidades")
        .select("valor")
        .gte("vencimento", firstDay)
        .lte("vencimento", lastDay);

      if (errorMensalidades) throw errorMensalidades;

      const receitaPrevistaSum = (mensalidadesMes || []).reduce(
        (sum, m) => sum + parseFloat(m.valor || "0"),
        0
      );

      // 3. Contar número de mensalistas inadimplentes
      const { data: mensalidadesAbertas, error: errorAbertas } = await supabase
        .from("mensalidades")
        .select("user_id")
        .in("status", ["Pendente", "Em atraso"]);

      if (errorAbertas) throw errorAbertas;

      const uniqueInadimplentes = new Set((mensalidadesAbertas || []).map((m) => m.user_id));
      const countInadimplentes = uniqueInadimplentes.size;

      setStats({
        mensalistas: countMensalistas || 0,
        receitaPrevista: receitaPrevistaSum,
        inadimplentes: countInadimplentes,
      });

      // 4. Buscar últimas transações
      const { data: transacoesData, error: errorTransacoes } = await supabase
        .from("transacoes")
        .select(`
          id,
          valor,
          metodo_pagamento,
          status,
          data_pagamento,
          mensalidade:mensalidade_id (
            id,
            profile:user_id (
              nome_completo
            )
          )
        `)
        .order("data_pagamento", { ascending: false })
        .limit(10);

      // Tratar dados de forma resiliente
      if (transacoesData) {
        const formattedAtividades = transacoesData.map((t: any) => {
          // A estrutura retornada depende do join do Supabase
          const profileData = t.mensalidade?.profile || t.mensalidade?.profiles;
          const nomeCompleto = profileData?.nome_completo || "Mensalista Anonimizado";
          const iniciais = nomeCompleto
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return {
            id: t.id,
            nome: nomeCompleto,
            iniciais,
            metodo: t.metodo_pagamento,
            valor: t.valor,
            status: t.status,
            data: t.data_pagamento,
          };
        });
        setAtividades(formattedAtividades);
      }
    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  useEffect(() => {
    const initData = async () => {
      await fetchAdminData();
      setLoading(false);
    };
    initData();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const diffMs = new Date().getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins}min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    return `Há ${diffDays}d`;
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-neutral-950 rounded-2xl p-6">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Carregando painel geral...</p>
      </main>
    );
  }

  const statCards = [
    {
      title: "Mensalistas",
      value: stats.mensalistas.toString(),
      icon: Users,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      description: "Clientes cadastrados",
    },
    {
      title: "Receita Prevista",
      value: `R$ ${stats.receitaPrevista.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      description: `Faturamento de ${new Date().toLocaleDateString("pt-BR", { month: "long" })}`,
    },
    {
      title: "Inadimplentes",
      value: stats.inadimplentes.toString(),
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
      description: "Mensalistas com débitos",
    },
  ];

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Visão Geral</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Indicadores operacionais e financeiros da RED PARK</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="h-10 w-10 border-gray-200 dark:border-neutral-800 transition-all duration-300"
        >
          <RefreshCw size={18} className={`${refreshing ? "animate-spin text-red-600" : "text-gray-500"}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-0 shadow-lg bg-white dark:bg-neutral-900 overflow-hidden relative group hover:scale-[1.01] transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50 dark:bg-neutral-850 px-2 py-0.5 rounded">
                    Filtro Mensal
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1.5 tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Últimas Atividades</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Últimos pagamentos detectados pelo sistema</p>
        </div>
        <Link href="/admin/baixa">
          <Button variant="ghost" size="sm" className="text-xs font-bold text-red-600 hover:text-red-700 p-0 flex items-center gap-1">
            Ir para Baixa Manual <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      
      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-neutral-900">
        {atividades.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <Clock size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Nenhum pagamento registrado ainda</p>
            <p className="text-xs text-gray-400 max-w-xs">Transações efetuadas por PIX ou baixa manual aparecerão aqui em tempo real.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-850">
            {atividades.map((atividade, i) => (
              <div key={i} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 dark:bg-neutral-900 dark:hover:bg-neutral-850/50 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center font-black text-sm text-red-600 dark:text-red-400 shadow-inner">
                    {atividade.iniciais}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                      {atividade.nome}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
                      <span>Compensação por <strong>{atividade.metodo}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-neutral-700" />
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{atividade.status}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-gray-900 dark:text-white leading-none">
                    R$ {parseFloat(atividade.valor).toFixed(2).replace(".", ",")}
                  </p>
                  <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 mt-1 block">
                    {formatRelativeTime(atividade.data)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
