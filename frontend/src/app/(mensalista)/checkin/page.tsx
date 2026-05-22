"use client";

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Camera } from "lucide-react";

export default function CheckinPage() {
  const [time, setTime] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhoto(url);
    }
  };
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const user = {
    name: "Matheus Yamauti",
    status: "Pago",
    car: {
      model: "Honda Civic Touring",
      plate: "ABC-1234",
    }
  };

  const isEmDia = user.status === 'Pago';

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col p-6 items-center justify-center">
      <h1 className="text-white font-bold text-xl mb-6">Passe Digital RED PARK</h1>
      
      <Card className={`w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl ${isEmDia ? 'shadow-green-500/20 border-green-500/50' : 'shadow-red-500/20 border-red-500/50'}`}>
        <div className={`p-6 text-center text-white ${isEmDia ? 'bg-green-600' : 'bg-red-600'}`}>
          <div className="flex justify-center mb-3">
            {isEmDia ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-widest">{isEmDia ? "Acesso Liberado" : "Acesso Bloqueado"}</h2>
          <p className="opacity-90 mt-1 font-medium">{isEmDia ? "Mensalidade em dia" : "Consta débito pendente"}</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 relative">
          <div className="absolute top-0 left-0 w-full h-4 -mt-2 flex justify-between px-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-gray-900" />
            ))}
          </div>

          <div className="pt-4 flex flex-col items-center">
            <label className="w-24 h-24 rounded-full bg-gray-100 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900 shadow-md flex flex-col items-center justify-center mb-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors overflow-hidden relative group">
              {photo ? (
                <>
                  <img src={photo} alt="Foto escolhida" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </>
              ) : (
                <>
                  <Camera className="text-gray-400 w-8 h-8 mb-1" />
                  <span className="text-[10px] text-gray-500 font-semibold uppercase text-center leading-tight">Adicionar<br/>Foto</span>
                </>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">{user.name}</h3>
            
            <div className="w-full h-px bg-gray-200 dark:bg-neutral-800 my-6" />

            <div className="w-full grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Veículo</p>
                <p className="font-semibold text-gray-900 dark:text-white">{user.car.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Placa</p>
                <div className="inline-block mt-1 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded border border-gray-300 dark:border-neutral-700 font-mono font-bold">
                  {user.car.plate}
                </div>
              </div>
            </div>


            {!isEmDia && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center text-sm font-medium border border-red-100 dark:border-red-900/50">
                Por favor, regularize sua situação no menu "Pagar" para liberar o acesso.
              </div>
            )}

            <p className="text-gray-400 text-xs mt-6">Válido para hoje, às {time}</p>
          </div>
        </div>
      </Card>
    </main>
  );
}
