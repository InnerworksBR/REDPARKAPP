"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, CreditCard, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const user = {
    name: "Matheus Yamauti",
    status: "Pendente",
    dueDate: "15/06/2026",
    car: {
      model: "Honda HRV EXL",
      plate: "FMJ5E22",
      image: "https://images.unsplash.com/photo-1590362891991-f761595183db?auto=format&fit=crop&q=80&w=800",
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pago': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'Em atraso': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    }
  };

  const StatusIcon = user.status === 'Pago' ? CheckCircle2 : AlertCircle;

  return (
    <main className="p-6 pt-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, Mensalista!</h1>
          <p className="text-gray-500 text-sm">Seu painel RED PARK</p>
        </div>
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <Car className="text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-40 w-full relative">
            <img 
              src={user.car.image} 
              alt="Carro do usuário" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-sm font-medium opacity-80">Veículo Cadastrado</p>
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-bold">{user.car.model}</h2>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-md border border-white/30 font-mono font-bold tracking-widest">
                  {user.car.plate}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Mensalidade</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(user.status)}`}>
                <StatusIcon size={14} />
                {user.status}
              </span>
            </div>
            
            <div className="bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Vencimento</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Valor</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">R$ 250,00</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/pagamento" className="flex-1">
                <Button className="w-full h-14" variant={user.status === 'Pago' ? "outline" : "default"}>
                  <CreditCard className="mr-2" />
                  {user.status === 'Pago' ? 'Ver Recibo' : 'Pagar Agora'}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Link href="/checkin" className="block">
          <Button variant="secondary" className="w-full h-16 text-lg rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50">
            Ticket 
          </Button>
        </Link>
      </div>
    </main>
  );
}
