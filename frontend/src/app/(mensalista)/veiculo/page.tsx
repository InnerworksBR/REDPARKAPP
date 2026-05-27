"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UploadCloud, AlertCircle, Loader2, Save, CheckCircle2 } from "lucide-react";

export default function EditVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");
  const [fotoCarro, setFotoCarro] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/clientes/login");
          return;
        }

        const { data, error } = await supabase
          .from("veiculos")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setVehicleId(data.id);
          setPlaca(data.placa || "");
          setModelo(data.modelo || "");
          if (data.foto_url) setPreviewFoto(data.foto_url);
        }
      } catch (err) {
        console.error("Erro ao carregar veículo:", err);
        setError("Não foi possível carregar os dados do seu veículo.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoCarro(file);
      setPreviewFoto(URL.createObjectURL(file));
      setSuccess(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalFotoUrl = previewFoto;

      // Se uma nova foto foi selecionada, fazemos o upload
      if (fotoCarro) {
        const fileExt = fotoCarro.name.split(".").pop();
        const fileName = `${Date.now()}_car.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("vehicles")
          .upload(filePath, fotoCarro, {
            contentType: fotoCarro.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Erro no upload da imagem:", uploadError);
          throw new Error("Erro ao enviar a imagem. Tente novamente mais tarde.");
        }

        const { data: urlData } = supabase.storage.from("vehicles").getPublicUrl(filePath);
        finalFotoUrl = urlData.publicUrl;
      }

      const vehicleData = {
        user_id: user.id,
        placa: placa.toUpperCase().trim(),
        modelo: modelo.trim(),
        foto_url: finalFotoUrl && finalFotoUrl.startsWith('blob:') ? null : finalFotoUrl,
      };

      if (vehicleId) {
        const { error: updateError } = await supabase
          .from("veiculos")
          .update(vehicleData)
          .eq("id", vehicleId);
        
        if (updateError) throw updateError;
      } else {
        const { data: newVehicle, error: insertError } = await supabase
          .from("veiculos")
          .insert(vehicleData)
          .select("id")
          .single();
          
        if (insertError) throw insertError;
        setVehicleId(newVehicle.id);
      }

      setSuccess(true);
      
      // Opcional: voltar para o dashboard após uns segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao salvar veículo.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col p-6 pt-12 animate-in fade-in duration-500">
      <Link href="/dashboard" className="w-12 h-12 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full shadow-sm mb-6 transition-transform hover:scale-105 active:scale-95">
        <ArrowLeft className="text-gray-900 dark:text-gray-50" size={24} />
      </Link>

      <div className="flex-1 max-w-md w-full mx-auto">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Seu Veículo</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Atualize os dados e a foto do seu carro cadastrado.
        </p>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-150 dark:border-red-900/50 mb-6 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-4 rounded-xl border border-green-200 dark:border-green-900/50 mb-6 text-sm font-medium">
            <CheckCircle2 size={20} className="shrink-0" />
            <span>Veículo salvo com sucesso! Voltando...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl shadow-lg border border-gray-100 dark:border-neutral-800 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Foto do Carro</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:hover:bg-neutral-800 dark:bg-neutral-950 hover:bg-gray-100 dark:border-neutral-700 overflow-hidden relative transition-colors">
                  {previewFoto ? (
                    <img src={previewFoto} alt="Preview do veículo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-600" />
                      <p className="mb-1 text-sm text-gray-600 dark:text-gray-400 font-semibold">Tocar para enviar</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG ou WEBP</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Modelo do Veículo</label>
              <Input 
                type="text" 
                placeholder="Ex: Honda Civic" 
                value={modelo}
                onChange={(e) => {
                  setModelo(e.target.value);
                  setSuccess(false);
                }}
                required 
                className="h-12 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Placa</label>
              <Input 
                type="text" 
                placeholder="ABC-1234" 
                value={placa}
                onChange={(e) => {
                  setPlaca(e.target.value);
                  setSuccess(false);
                }}
                required 
                className="uppercase font-mono text-lg tracking-widest h-12 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800" 
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full h-14 text-base font-bold shadow-xl shadow-red-600/20 rounded-2xl gap-2" disabled={saving || success}>
            {saving ? (
              <><Loader2 className="animate-spin" size={20} /> Salvando...</>
            ) : (
              <><Save size={20} /> Salvar Alterações</>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
