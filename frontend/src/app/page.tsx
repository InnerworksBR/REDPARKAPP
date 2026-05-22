import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CarFront, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-red-600 dark:bg-red-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-red-900 blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-md flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-24 h-24 bg-white text-red-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/50 mb-8 rotate-3">
          <CarFront size={48} strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight mb-2 text-center">
          RED PARK
        </h1>
        <p className="text-red-100 text-center mb-12 text-lg px-4">
          Seu estacionamento, mais seguro e prático.
        </p>

        <div className="w-full flex flex-col gap-4 bg-white/10 p-2 rounded-3xl backdrop-blur-md border border-white/20">
          <Link href="/clientes/login" className="w-full">
            <Button size="lg" className="w-full bg-white text-red-600 hover:bg-gray-100 text-lg rounded-2xl shadow-lg">
              Entrar
            </Button>
          </Link>
          <Link href="/clientes/cadastro" className="w-full">
            <Button size="lg" variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white text-lg rounded-2xl">
              Criar Conta
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-red-200">
          <ShieldCheck size={16} />
          <span>Ambiente 100% seguro</span>
        </div>
      </div>
    </main>
  );
}
