"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCog, Shield, AlertTriangle, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Profile = {
  id: string;
  nome_completo: string;
  email: string;
  role: "admin" | "mensalista";
  cpf: string;
};

export default function UsuariosPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome_completo, email, role, cpf")
        .order("nome_completo", { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      alert("Erro ao carregar usuários. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "mensalista" : "admin";
    const confirmMessage = currentRole === "admin" 
      ? "Tem certeza que deseja remover os privilégios de administrador deste usuário?" 
      : "Tem certeza que deseja promover este usuário a administrador?";

    if (!window.confirm(confirmMessage)) return;

    setUpdating(userId);
    try {
      // 1. Tentar usar a RPC (caso o usuário tenha criado a função SQL recomendada)
      const { error: rpcError } = await supabase.rpc('admin_toggle_user_role', {
        target_user_id: userId,
        new_role: newRole
      });

      if (rpcError) {
        // Fallback: se a RPC não existir, tentar via update normal
        // (só funcionará se as políticas de RLS permitirem, o que normalmente não permitem sem configuração prévia)
        console.warn("RPC admin_toggle_user_role falhou, tentando update direto. Erro:", rpcError);
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role: newRole })
          .eq("id", userId);
        
        if (updateError) throw updateError;
      }

      // Atualizar estado local
      setProfiles(prev => 
        prev.map(p => p.id === userId ? { ...p, role: newRole } : p)
      );
      
    } catch (error: any) {
      console.error("Erro ao alterar cargo do usuário:", error);
      alert("Erro ao alterar cargo. Talvez seja necessário rodar o script SQL de permissões. " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-500">Carregando usuários...</p>
      </main>
    );
  }

  return (
    <main className="p-6 pt-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Gerenciar Usuários</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Controle de acessos e permissões do sistema</p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm">
          <UserCog size={22} />
        </div>
      </div>
      
      <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-neutral-900">
        {profiles.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <Users size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-850">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-white hover:bg-gray-50/50 dark:bg-neutral-900 dark:hover:bg-neutral-850/50 transition-colors duration-200 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner ${profile.role === 'admin' ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'}`}>
                    {profile.role === 'admin' ? <Shield size={18} /> : <User size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                      {profile.nome_completo || "Sem Nome"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                      <span>{profile.email}</span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300 dark:bg-neutral-700" />
                      <span>CPF: {profile.cpf || "Não informado"}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-neutral-800">
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${profile.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400'}`}>
                    {profile.role}
                  </div>
                  
                  <Button
                    variant={profile.role === 'admin' ? 'outline' : 'default'}
                    size="sm"
                    className={`h-8 text-xs font-semibold w-28 ${profile.role === 'admin' ? 'text-gray-600 hover:text-red-600' : ''}`}
                    onClick={() => toggleRole(profile.id, profile.role)}
                    disabled={updating === profile.id}
                  >
                    {updating === profile.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : profile.role === 'admin' ? (
                      "Remover Admin"
                    ) : (
                      "Tornar Admin"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex gap-3 items-start">
        <AlertTriangle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-blue-800 dark:text-blue-300">
          <p className="font-bold mb-1">Atenção sobre privilégios de administrador:</p>
          <p>Administradores têm acesso a todo o painel financeiro, podem dar baixas manuais e gerenciar outros usuários. Seja cauteloso ao conceder este nível de acesso.</p>
        </div>
      </div>
    </main>
  );
}
