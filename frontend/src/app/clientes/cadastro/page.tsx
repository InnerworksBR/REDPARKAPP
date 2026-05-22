"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UploadCloud } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
   
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard"); 
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col p-6">
      <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow-sm mb-6">
        <ArrowLeft className="text-gray-900 dark:text-gray-50" size={24} />
      </Link>

      <div className="flex-1 max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Criar Conta</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Preencha seus dados para se tornar mensalista do RED PARK.
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Dados Pessoais</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome Completo</label>
              <Input type="text" placeholder="Seu nome" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</label>
                <Input type="text" placeholder="000.000.000-00" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CNH</label>
                <Input type="text" placeholder="Nº CNH" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <Input type="email" placeholder="email@exemplo.com" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Senha</label>
              <Input type="password" placeholder="Sua senha secreta" required />
            </div>


          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Dados do Veículo</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</label>
              <Input type="text" placeholder="ABC-1234" required className="uppercase" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto do Carro</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-neutral-800 hover:bg-gray-100 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span></p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2 shadow-xl shadow-red-600/20" disabled={loading}>
            {loading ? "Processando..." : "Finalizar Cadastro"}
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Já possui conta?{" "}
          <Link href="/clientes/login" className="text-red-600 font-bold hover:underline">
            Faça login
          </Link>
        </div>
      </div>
    </main>
  );
}
