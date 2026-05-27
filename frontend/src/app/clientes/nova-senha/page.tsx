"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NovaSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verificar se o usuário possui sessão (ou seja, se acessou pelo link do e-mail com token válido)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Supabase-js também reage ao hash #access_token da URL e cria a sessão
      if (!session) {
        // Tentar aguardar um breve instante caso o onAuthStateChange ainda esteja processando
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!delayedSession) {
            setError("Link de recuperação inválido ou expirado. Por favor, solicite um novo.");
          }
          setCheckingSession(false);
        }, 1500);
      } else {
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres.");
      }

      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem.");
      }

      // Atualizar a senha do usuário autenticado pela sessão de recuperação
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw new Error(updateError.message || "Erro ao atualizar a senha.");
      }

      setSuccess(true);
      
      // Redirecionar para o dashboard após alguns segundos
      setTimeout(() => {
        router.push("/clientes/login");
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao alterar sua senha.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Validando seu link de recuperação...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 mb-6 mx-auto">
          <Lock size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">Nova Senha</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
          Digite sua nova senha abaixo para acessar sua conta.
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Senha atualizada!</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          </div>
        ) : error && error.includes("inválido") ? (
          <Link href="/clientes/recuperar-senha" className="w-full mt-2">
            <Button variant="outline" className="w-full">Solicitar novo link</Button>
          </Link>
        ) : (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Nova Senha
              </label>
              <Input 
                type="password" 
                placeholder="No mínimo 6 caracteres" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Confirme a Nova Senha
              </label>
              <Input 
                type="password" 
                placeholder="Repita a senha" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full mt-4 shadow-xl shadow-red-600/20" disabled={loading}>
              {loading ? "Salvando..." : "Redefinir Senha"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
