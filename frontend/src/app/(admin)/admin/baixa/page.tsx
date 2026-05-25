"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, UserCircle2, AlertCircle, Calendar, DollarSign, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function BaixaManualPage() {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    setIsSearching(true);
    setResult(null);
    setError("");

    try {
      const cleanSearch = search.trim();
      const cleanCpf = cleanSearch.replace(/[^\d]/g, "");

      let matchedProfile = null;
      let matchedVeiculo = null;

      // 1. Tentar pesquisar por placa exata ou aproximada na tabela veiculos
      const { data: veiculosData, error: veiculosError } = await supabase
        .from("veiculos")
        .select(`
          *,
          profile:user_id (
            *
          )
        `)
        .ilike("placa", `%${cleanSearch}%`);

      if (veiculosError) throw veiculosError;

      if (veiculosData && veiculosData.length > 0) {
        matchedVeiculo = veiculosData[0];
        matchedProfile = veiculosData[0].profile;
      } else {
        // 2. Tentar pesquisar por CPF ou Nome Completo na tabela profiles
        let query = supabase.from("profiles").select(`
          *,
          veiculos (
            *
          )
        `);

        if (cleanCpf.length > 0) {
          query = query.or(`cpf.ilike.%${cleanCpf}%,nome_completo.ilike.%${cleanSearch}%`);
        } else {
          query = query.ilike("nome_completo", `%${cleanSearch}%`);
        }

        const { data: profilesData, error: profilesError } = await query.limit(1);

        if (profilesError) throw profilesError;

        if (profilesData && profilesData.length > 0) {
          matchedProfile = profilesData[0];
          matchedVeiculo = profilesData[0].veiculos?.[0] || null;
        }
      }

      if (!matchedProfile) {
        setError("Nenhum mensalista cadastrado foi localizado com os termos informados.");
        setIsSearching(false);
        return;
      }

      // 3. Obter a última mensalidade deste usuário
      const { data: mensalidadeData, error: mensalidadeError } = await supabase
        .from("mensalidades")
        .select("*")
        .eq("user_id", matchedProfile.id)
        .order("vencimento", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mensalidadeError) throw mensalidadeError;

      setResult({
        profile: matchedProfile,
        veiculo: matchedVeiculo,
        mensalidade: mensalidadeData,
      });

    } catch (err: any) {
      console.error("Erro na busca de portaria:", err.message);
      setError("Ocorreu um erro ao consultar o banco de dados. Tente novamente.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleBaixa = async () => {
    if (!result || !result.mensalidade) return;

    setClearing(true);
    setError("");

    try {
      const mId = result.mensalidade.id;
      const valor = parseFloat(result.mensalidade.valor);

      // Tentar efetuar a transação via RPC segura (SECURITY DEFINER)
      const { error: rpcError } = await supabase.rpc("pay_mensalidade", {
        p_mensalidade_id: mId,
        p_metodo: "Manual",
        p_valor: valor
      });

      if (rpcError) {
        console.warn("RPC pay_mensalidade ausente ou com erro. Tentando compensação direta client-side...", rpcError.message);

        // Fallback direto via client updates (permitido por RLS para admin)
        const { error: updateError } = await supabase
          .from("mensalidades")
          .update({ status: "Pago" })
          .eq("id", mId);

        if (updateError) throw updateError;

        const { error: transacaoError } = await supabase
          .from("transacoes")
          .insert({
            mensalidade_id: mId,
            gateway_id: "MANUAL-PORTARIA-" + Math.floor(Math.random() * 100000000),
            valor: valor,
            metodo_pagamento: "Manual",
            status: "Aprovado"
          });

        if (transacaoError) throw transacaoError;
      }

      // Sucesso! Atualizar estado local para refletir na tela
      setResult({
        ...result,
        mensalidade: {
          ...result.mensalidade,
          status: "Pago"
        }
      });

    } catch (err: any) {
      console.error("Erro ao registrar baixa manual:", err.message);
      setError("Não foi possível confirmar o pagamento. Verifique as conexões e tente novamente.");
    } finally {
      setClearing(false);
    }
  };

  const formatCpf = (cpf: string) => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/dashboard" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full border border-gray-150 dark:border-neutral-800 shadow-sm shrink-0">
          <ArrowLeft className="text-gray-900 dark:text-white" size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Baixa Manual</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Compensação presencial em dinheiro, Pix ou transferência</p>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="flex-1">
          <Input 
            type="text" 
            placeholder="Buscar por placa (ex: ABC1234), CPF ou Nome..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
            className="h-14 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 shadow-sm"
          />
        </div>
        <Button type="submit" size="icon" className="h-14 w-14 shrink-0 bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/10">
          <Search size={22} />
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50 mb-6 text-sm font-medium animate-in shake duration-300">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSearching && (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-xs font-semibold text-gray-400">Procurando mensalista no sistema...</p>
        </div>
      )}

      {result && !isSearching && (
        <Card className="border border-gray-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900 overflow-hidden animate-in slide-in-from-bottom-4 duration-400 relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-neutral-850 pb-6 mb-6">
              {result.profile.avatar_url ? (
                <img 
                  src={result.profile.avatar_url} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-100 dark:border-red-900/50 shadow-inner" 
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center font-black text-xl text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                  {result.profile.nome_completo.split(" ").map((n: string) => n[0]).slice(0,2).join("").toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white leading-tight">{result.profile.nome_completo}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">CPF: {formatCpf(result.profile.cpf)}</p>
              </div>
            </div>

            {!result.mensalidade ? (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 p-5 rounded-xl border border-yellow-150 dark:border-yellow-900/30 text-sm font-medium text-center">
                Este mensalista não possui mensalidades ativas configuradas no sistema.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl flex items-center gap-3">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Vencimento</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                        {new Date(result.mensalidade.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl flex items-center gap-3">
                    <DollarSign className="text-gray-400" size={20} />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valor Faturado</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                        R$ {parseFloat(result.mensalidade.valor).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Veículo Registrado</p>
                    <p className="font-bold text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                      {result.veiculo?.modelo || "Modelo não cadastrado"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 px-3 py-1 rounded-md font-mono font-bold tracking-widest text-sm text-gray-900 dark:text-white uppercase">
                    {result.veiculo?.placa || "S/ PLACA"}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-neutral-850 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Situação Atual</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    result.mensalidade.status === 'Pago' 
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800'
                  }`}>
                    {result.mensalidade.status === 'Pago' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Aprovado e Compensado
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        Aguardando Recebimento
                      </>
                    )}
                  </span>
                </div>

                <Button 
                  className={`w-full h-14 text-base font-bold transition-all duration-300 shadow-lg ${
                    result.mensalidade.status === 'Pago'
                      ? 'bg-gray-50 dark:bg-neutral-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-neutral-700 shadow-none'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10'
                  }`}
                  onClick={handleBaixa}
                  disabled={result.mensalidade.status === 'Pago' || clearing}
                >
                  {clearing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Registrando compensação...
                    </span>
                  ) : result.mensalidade.status === 'Pago' ? (
                    <span className="flex items-center justify-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="text-green-500" size={20} /> Baixa Compensada com Sucesso
                    </span>
                  ) : (
                    "Confirmar Baixa Manual"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
