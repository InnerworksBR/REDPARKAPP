"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, CreditCard, Copy, CheckCircle2, ChevronRight, QrCode, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PagamentoPage() {
  const [loading, setLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [mensalidade, setMensalidade] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);

  // Carregar dados iniciais e escutar realtime
  useEffect(() => {
    let channel: any;

    const initPage = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // 1. Carregar mensalidade ativa mais recente
        const { data: mData, error: mError } = await supabase
          .from("mensalidades")
          .select("*")
          .eq("user_id", authUser.id)
          .order("vencimento", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mError) throw mError;

        if (mData) {
          setMensalidade(mData);
          if (mData.status === "Pago") {
            setIsPaid(true);
            // Buscar dados da transação para exibir no recibo
            const { data: tData } = await supabase
              .from("transacoes")
              .select("*")
              .eq("mensalidade_id", mData.id)
              .maybeSingle();
            
            if (tData) {
              setTransactionData(tData);
            }
          }
        }

        // 2. Subscrever a escuta Realtime para alteração de mensalidades do usuário
        channel = supabase
          .channel(`mensalidades-user-${authUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "mensalidades",
              filter: `user_id=eq.${authUser.id}`,
            },
            async (payload: any) => {
              const updated = payload.new;
              if (updated && updated.id === mData?.id) {
                setMensalidade(updated);
                if (updated.status === "Pago") {
                  setIsPaid(true);
                  // Buscar transação gerada
                  const { data: tData } = await supabase
                    .from("transacoes")
                    .select("*")
                    .eq("mensalidade_id", updated.id)
                    .maybeSingle();
                  
                  if (tData) {
                    setTransactionData(tData);
                  }
                }
              }
            }
          )
          .subscribe();

      } catch (error) {
        console.error("Erro ao carregar faturamento:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleCheckout = async () => {
    if (!mensalidade) return;
    setIsProcessingCheckout(true);

    try {
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensalidade_id: mensalidade.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar checkout');
      }

      if (data.init_point) {
        // Redireciona o usuário para o ambiente seguro do Mercado Pago
        window.location.href = data.init_point;
      } else {
        throw new Error('URL de checkout não retornada pelo gateway');
      }
    } catch (err: any) {
      console.error('Erro no checkout:', err.message);
      alert(err.message || 'Houve um problema ao iniciar o pagamento.');
      setIsProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Carregando faturamento...</p>
        </div>
      </main>
    );
  }

  if (!mensalidade) {
    return (
      <main className="p-6 pt-12 animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financeiro</h1>
        <Card className="border-gray-200 dark:border-neutral-800 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-950 dark:text-white mb-2">Tudo em dia!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
              Nenhuma mensalidade pendente foi encontrada para o seu usuário. Obrigado por sua parceria!
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const displayDueDate = mensalidade.vencimento
    ? new Date(mensalidade.vencimento + "T00:00:00").toLocaleDateString("pt-BR")
    : "--/--/----";

  const displayValue = mensalidade.valor
    ? `R$ ${parseFloat(mensalidade.valor).toFixed(2).replace(".", ",")}`
    : "R$ 250,00";

  const pixCodeFallback = `00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865406250.005802BR5916RED PARK ESTACIO6009SAO PAULO62140510mensal062663041D3D`;

  if (isPaid) {
    return (
      <main className="p-6 pt-12 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/10">
          <CheckCircle2 size={40} className="animate-bounce" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pagamento Aprovado!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-sm">
          Sua mensalidade de {new Date(mensalidade.vencimento + "T00:00:00").toLocaleDateString("pt-BR", { month: "long" })} foi paga com sucesso. Seu acesso já está liberado!
        </p>
        
        <Card className="w-full mb-8 border-green-500/20 shadow-xl shadow-green-500/5">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Valor Pago</span>
              <span className="font-bold text-gray-900 dark:text-white text-lg">{displayValue}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Data de Vencimento</span>
              <span className="font-semibold text-gray-900 dark:text-white">{displayDueDate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Data do Pagamento</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {transactionData?.data_pagamento
                  ? new Date(transactionData.data_pagamento).toLocaleDateString('pt-BR')
                  : new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Método</span>
              <span className="font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest text-sm bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded">
                {transactionData?.metodo_pagamento || "PIX"}
              </span>
            </div>
          </CardContent>
        </Card>

        {showReceipt && transactionData && (
          <Card className="w-full mb-6 border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 animate-in slide-in-from-top-4 duration-300">
            <CardContent className="p-5 space-y-3 font-mono text-xs text-gray-600 dark:text-gray-400">
              <p className="font-bold text-center border-b border-dashed border-gray-300 dark:border-neutral-700 pb-2 text-gray-800 dark:text-gray-200">RED PARK ESTACIONAMENTO</p>
              <div className="flex justify-between">
                <span>TRANSACAO ID:</span>
                <span className="text-right select-all">{transactionData.id}</span>
              </div>
              <div className="flex justify-between">
                <span>GATEWAY ID:</span>
                <span className="text-right">{transactionData.gateway_id || "INTERNO"}</span>
              </div>
              <div className="flex justify-between">
                <span>MENSALIDADE ID:</span>
                <span className="text-right select-all">{transactionData.mensalidade_id}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-300 dark:border-neutral-700 pt-2 font-bold text-gray-800 dark:text-gray-200">
                <span>TOTAL:</span>
                <span>{displayValue}</span>
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">AUTENTICADO COM SUCESSO VIA SUPABASE</p>
            </CardContent>
          </Card>
        )}

        <Button onClick={() => setShowReceipt(!showReceipt)} variant="outline" className="w-full h-14 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-neutral-900">
          <Receipt className="mr-2" />
          {showReceipt ? "Ocultar Comprovante" : "Ver Comprovante Detalhado"}
        </Button>
      </main>
    );
  }

  return (
    <main className="p-6 pt-12 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Financeiro</h1>
      
      <Card className="border-red-500/30 shadow-lg shadow-red-500/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                Mensalidade de {new Date(mensalidade.vencimento + "T00:00:00").toLocaleDateString("pt-BR", { month: "long" })}
              </p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">{displayValue}</h2>
            </div>
            <div className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              Pendente
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vencimento</span>
            <span className="font-bold text-gray-900 dark:text-white">{displayDueDate}</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ambiente de Pagamento</p>
            
            <Button 
              onClick={handleCheckout} 
              disabled={isProcessingCheckout}
              className="w-full h-16 bg-[#009EE3] hover:bg-[#008ACA] text-white text-lg font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-3 rounded-2xl"
            >
              {isProcessingCheckout ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Gerando Checkout Seguro...</span>
                </>
              ) : (
                <>
                  <CreditCard size={24} />
                  <span>Pagar com Mercado Pago</span>
                </>
              )}
            </Button>
            
            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
              Ambiente Seguro e Criptografado pelo <strong>Mercado Pago</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
