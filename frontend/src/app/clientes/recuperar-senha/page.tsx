"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RecuperarSenhaPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let email = identifier;

      // Se não for um formato de e-mail (não contiver '@'), tratamos como CPF
      if (!identifier.includes("@")) {
        const cleanCpf = identifier.replace(/[^\d]/g, "");

        if (!cleanCpf) {
          throw new Error("Por favor, digite um CPF ou Email válido.");
        }

        // Buscar email correspondente na tabela profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("cpf", cleanCpf)
          .maybeSingle();

        if (profileError || !profile?.email) {
          throw new Error("CPF não encontrado no sistema.");
        }

        email = profile.email;
      }

      // Enviar e-mail de recuperação usando a URL atual como base para o redirecionamento
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/clientes/nova-senha`,
      });

      if (resetError) {
        if (resetError.status === 429) {
          throw new Error("Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.");
        }
        if (resetError.status === 504 || resetError.status === 500) {
          throw new Error("O servidor de e-mails está demorando muito para responder (Timeout/Erro Interno). Ele pode estar sobrecarregado. Por favor, tente novamente em alguns minutos.");
        }
        
        let msg = resetError.message;
        if (typeof msg === 'object' || msg === '{}') {
          msg = "Erro desconhecido ao se comunicar com o servidor.";
        }
        throw new Error(msg || "Erro ao enviar e-mail de recuperação.");
      }

      setSuccess(true);
    } catch (err: any) {
      // Evitamos usar console.error(err) aqui pois em ambiente de desenvolvimento
      // o Next.js intercepta e abre uma tela cheia de erro desnecessária.
      let errorMsg = err.message || "Erro inesperado ao solicitar recuperação de senha.";
      
      if (errorMsg === "{}" || typeof errorMsg === "object") {
        errorMsg = "O servidor demorou muito para responder (Timeout). O sistema de e-mails pode estar temporariamente sobrecarregado.";
      }
      
      setError(String(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col p-6">
      <Link href="/clientes/login" className="w-12 h-12 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow-sm mb-8">
        <ArrowLeft className="text-gray-900 dark:text-gray-50" size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 mb-6">
          <KeyRound size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recuperar Senha</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Digite seu CPF ou E-mail e enviaremos um link para você redefinir sua senha.
        </p>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-150 dark:border-red-900/50 mb-6 text-sm font-medium animate-in shake duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 text-center flex flex-col items-center gap-4 animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">E-mail enviado!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.
              </p>
            </div>
            <Link href="/clientes/login" className="w-full mt-2">
              <Button variant="outline" className="w-full">Voltar para o Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                CPF ou Email
              </label>
              <Input 
                type="text" 
                placeholder="Digite seu CPF ou Email" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full mt-2 shadow-xl shadow-red-600/20" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
