import { NextResponse } from 'next/server';
import { preference } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mensalidade_id } = body;

    if (!mensalidade_id) {
      return NextResponse.json({ error: 'Mensalidade ID é obrigatório' }, { status: 400 });
    }

    // 1. Validar a mensalidade de forma segura no backend usando Supabase
    const { data: mensalidade, error } = await supabaseAdmin
      .from('mensalidades')
      .select('*')
      .eq('id', mensalidade_id)
      .maybeSingle();

    if (error || !mensalidade) {
      return NextResponse.json({ error: 'Mensalidade não encontrada' }, { status: 404 });
    }

    if (mensalidade.status === 'Pago') {
      return NextResponse.json({ error: 'Esta mensalidade já está paga' }, { status: 400 });
    }

    // 2. Criar a preferência no Mercado Pago
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const prefBody = {
      items: [
        {
          id: mensalidade.id.toString(),
          title: 'Mensalidade RED PARK',
          quantity: 1,
          unit_price: parseFloat(mensalidade.valor),
          currency_id: 'BRL',
        }
      ],
      back_urls: {
        success: `${appUrl}/dashboard?payment=success`,
        failure: `${appUrl}/pagamento?payment=failure`,
        pending: `${appUrl}/pagamento?payment=pending`
      },
      auto_return: 'approved',
      // O webhook será implementado no Ciclo 3
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      external_reference: mensalidade.id.toString(),
    };

    const response = await preference.create({ body: prefBody });

    // 3. Retornar a URL de checkout (init_point) gerada pelo Mercado Pago
    return NextResponse.json({ 
      preferenceId: response.id, 
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error('Erro ao gerar preferência no Mercado Pago:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
