"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UploadCloud, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ErrorWithDetails = Error & {
  status?: number;
  code?: string;
};

const isRateLimitError = (error?: ErrorWithDetails | null) => {
  const message = error?.message?.toLowerCase() ?? "";

  return (
    error?.status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many")
  );
};

const getAuthErrorMessage = (error?: ErrorWithDetails | null) => {
  if (error?.status === 504 || error?.name === 'AuthRetryableFetchError') {
    return "Tempo limite excedido ao tentar conectar ao Supabase (HTTP 504). Isso frequentemente ocorre se o limite de envio de e-mails de confirmação do Supabase foi atingido. Tente desativar 'Confirm Email' no painel do Supabase (Authentication -> Providers -> Email).";
  }

  if (isRateLimitError(error)) {
    return "Limite do Supabase Auth atingido (HTTP 429). Aguarde alguns minutos e tente novamente. Em desenvolvimento, isso tambem pode acontecer por limite de envio de email do projeto.";
  }

  return error?.message && error.message !== '{}' 
    ? error.message 
    : "Erro ao criar conta. Verifique suas credenciais e a configuração do Supabase.";
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Erro ao realizar cadastro.";
};

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados dos campos do formulário
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnh, setCnh] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [fotoCarro, setFotoCarro] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoCarro(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanCpf = cpf.replace(/[^\d]/g, "");
      if (cleanCpf.length !== 11) {
        throw new Error("Por favor, digite um CPF válido com 11 dígitos.");
      }

      // Verificações prévias de duplicidade
      const { data: cpfExistente } = await supabase.from("profiles").select("id").eq("cpf", cleanCpf).maybeSingle();
      if (cpfExistente) throw new Error("Este CPF já está cadastrado.");

      const { data: emailExistente } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
      if (emailExistente) throw new Error("Este email já está cadastrado.");

      const { data: placaExistente } = await supabase.from("veiculos").select("id").eq("placa", placa.toUpperCase().trim()).maybeSingle();
      if (placaExistente) throw new Error("Esta placa já está cadastrada no sistema.");

      // 1. Cadastrar usuário no Supabase Auth
      // O trigger no banco de dados irá copiar estes metadados automaticamente para public.profiles
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome_completo: nome,
            cpf: cleanCpf,
            cnh: cnh,
            role: "mensalista"
          }
        }
      });

      if (authError || !authData.user) {
        if (authError) {
          const errDetails = authError as unknown as ErrorWithDetails;
          console.error("Erro no cadastro Supabase Auth", {
            status: errDetails.status,
            code: errDetails.code,
            name: errDetails.name,
            message: errDetails.message,
          });
        }

        throw new Error(getAuthErrorMessage(authError));
      }

      const userId = authData.user.id;
      let fotoUrl = null;

      // 2. Fazer upload da foto do carro para o Supabase Storage (se houver)
      if (fotoCarro) {
        const fileExt = fotoCarro.name.split(".").pop();
        const fileName = `${Date.now()}_car.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("vehicles")
          .upload(filePath, fotoCarro, {
            contentType: fotoCarro.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Erro no upload da imagem:", uploadError);
          // Ignoramos o erro de upload na hora do cadastro para não travar a criação do carro
          // O usuário pode tentar fazer o upload novamente no painel.
        } else {
          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from("vehicles")
            .getPublicUrl(filePath);
          fotoUrl = urlData.publicUrl;
        }
      }

      // 3. Cadastrar veículo associado
      const { error: veiculoError } = await supabase
        .from("veiculos")
        .insert({
          user_id: userId,
          placa: placa.toUpperCase().trim(),
          modelo: modelo.trim() || "Veículo Cadastrado",
          foto_url: fotoUrl
        });

      if (veiculoError) {
        throw new Error(`Erro ao salvar veículo: ${veiculoError.message}`);
      }

      // 4. Inicializar cobrança de mensalidade pendente para o mês vigente
      const nextDueDate = new Date();
      nextDueDate.setDate(15); // Vence todo dia 15
      if (nextDueDate < new Date()) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      }
      
      const formattedDate = nextDueDate.toISOString().split("T")[0];

      const { error: mensalidadeError } = await supabase
        .from("mensalidades")
        .insert({
          user_id: userId,
          valor: 250.00,
          vencimento: formattedDate,
          status: "Pendente"
        });

      if (mensalidadeError) {
        console.error("Erro ao gerar mensalidade:", mensalidadeError);
      }

      // Login bem sucedido pós cadastro
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-150 dark:border-red-900/50 mb-6 text-sm font-medium animate-in shake duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Dados Pessoais</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome Completo</label>
              <Input 
                type="text" 
                placeholder="Seu nome completo" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CPF</label>
                <Input 
                  type="text" 
                  placeholder="000.000.000-00" 
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CNH</label>
                <Input 
                  type="text" 
                  placeholder="Nº CNH" 
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <Input 
                type="email" 
                placeholder="email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Senha</label>
              <Input 
                type="password" 
                placeholder="Sua senha secreta" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-neutral-800 space-y-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-200">Dados do Veículo</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Placa</label>
                <Input 
                  type="text" 
                  placeholder="ABC-1234" 
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  required 
                  className="uppercase" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo do Veículo</label>
                <Input 
                  type="text" 
                  placeholder="Ex: Honda Civic" 
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Foto do Carro</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-neutral-800 hover:bg-gray-100 dark:border-neutral-600 dark:hover:border-neutral-500 dark:hover:bg-neutral-700 overflow-hidden relative">
                    {previewFoto ? (
                      <img src={previewFoto} alt="Preview do veículo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Clique para enviar</span></p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
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

