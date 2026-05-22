"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, CreditCard, Copy, CheckCircle2, ChevronRight, QrCode } from "lucide-react";

export default function PagamentoPage() {
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const mensalidade = {
    valor: 250.00,
    vencimento: "15/06/2026",
    status: isPaid ? "Pago" : "Pendente",
    pixCode: "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865406250.005802BR5916RED PARK ESTACIO6009SAO PAULO62140510mensal062663041D3D"
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(mensalidade.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    setTimeout(() => setIsPaid(true), 5000);
  };

  if (isPaid) {
    return (
      <main className="p-6 pt-12 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pagamento Aprovado!</h1>
        <p className="text-gray-500 text-center mb-8">
          Sua mensalidade de Junho foi paga com sucesso. Seu acesso já está liberado.
        </p>
        
        <Card className="w-full mb-8">
          <CardContent className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
              <span className="text-gray-500">Valor Pago</span>
              <span className="font-bold text-gray-900 dark:text-white">R$ 250,00</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-800 pb-4">
              <span className="text-gray-500">Data</span>
              <span className="font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Método</span>
              <span className="font-bold text-gray-900 dark:text-white">PIX</span>
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="w-full h-14">
          <Receipt className="mr-2" />
          Ver Comprovante Detalhado
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
              <p className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Mensalidade Junho</p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">R$ 250,00</h2>
            </div>
            <div className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">
              Pendente
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-4 mb-6 flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vencimento</span>
            <span className="font-bold text-gray-900 dark:text-white">{mensalidade.vencimento}</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Formas de Pagamento</p>
            
            <div className="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                  <QrCode size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">PIX Copia e Cola</h4>
                  <p className="text-xs text-gray-500">Aprovação imediata</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-neutral-900 rounded-xl p-3 text-xs text-gray-500 font-mono truncate border border-gray-200 dark:border-neutral-800">
                  {mensalidade.pixCode}
                </div>
                <Button onClick={handleCopyPix} variant="secondary" className="h-auto px-4 shrink-0 bg-red-100 text-red-700 hover:bg-red-200">
                  {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full h-14 justify-between group">
              <div className="flex items-center">
                <CreditCard className="mr-3 text-gray-400" />
                <span>Cartão de Crédito</span>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            </Button>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            Pagamentos processados via <strong>Mercado Pago</strong>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
