"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CarFront, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      // Efetuar login no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error("Credenciais inválidas. Verifique os dados digitados.");
      }

      // Buscar a role do usuário logado
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user?.id)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Erro ao carregar o perfil de usuário.");
      }

      // Redirecionamento baseado no papel do usuário
      if (profile.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao realizar login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col p-6">
      <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow-sm mb-8">
        <ArrowLeft className="text-gray-900 dark:text-gray-50" size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 mb-6">
          <CarFront size={32} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo de volta!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Acesse sua conta para gerenciar seu estacionamento.
        </p>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-150 dark:border-red-900/50 mb-6 text-sm font-medium animate-in shake duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <Link href="/clientes/recuperar-senha" className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-500 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Input 
              type="password" 
              placeholder="Sua senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-8 text-center text-gray-500 text-sm">
          Ainda não tem conta?{" "}
          <Link href="/clientes/cadastro" className="text-red-600 font-bold hover:underline">
            Cadastre-se
          </Link>
        </div>
      </div>
    </main>
  );
}

