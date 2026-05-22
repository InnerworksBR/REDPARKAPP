"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, UserCircle2 } from "lucide-react";

export default function BaixaManualPage() {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        name: "Carlos Eduardo",
        plate: "XYZ-9876",
        status: "Pendente",
        dueDate: "15/06/2026",
      });
    }, 1000);
  };

  const handleBaixa = () => {
    setResult({ ...result, status: "Pago" });
  };

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Baixa Manual</h2>
      <p className="text-sm text-gray-500 mb-6">Localize o mensalista pela placa, CPF ou Nome para confirmar pagamento em dinheiro/transferência direta.</p>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="flex-1">
          <Input 
            type="text" 
            placeholder="Ex: ABC-1234 ou CPF..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14"
          />
        </div>
        <Button type="submit" size="icon" className="h-14 w-14 shrink-0 bg-red-600">
          <Search size={24} />
        </Button>
      </form>

      {isSearching && (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {result && !isSearching && (
        <Card className="border border-red-100 dark:border-neutral-800 shadow-lg shadow-red-500/5 animate-in slide-in-from-bottom-4">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <UserCircle2 size={48} className="text-gray-400" />
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{result.name}</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{result.plate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Vencimento</p>
                <p className="font-bold text-gray-900 dark:text-white">{result.dueDate}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</p>
                <p className={`font-bold ${result.status === 'Pago' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {result.status}
                </p>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-base" 
              variant={result.status === 'Pago' ? 'outline' : 'default'}
              onClick={handleBaixa}
              disabled={result.status === 'Pago'}
            >
              {result.status === 'Pago' ? (
                <>
                  <CheckCircle2 className="mr-2" />
                  Baixa Realizada
                </>
              ) : (
                'Confirmar Pagamento'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
