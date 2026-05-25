import { NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    // O webhook pode receber payload no body também
    const body = await request.json().catch(() => ({}));
    
    const paymentId = body?.data?.id || dataId;
    const paymentAction = body?.action || action;

    // Verificamos apenas atualizações de pagamento
    if (paymentAction === 'payment.updated' || paymentAction === 'payment.created') {
      if (!paymentId) {
        return NextResponse.json({ error: 'ID de pagamento não fornecido' }, { status: 400 });
      }

      // Buscar status real do pagamento na API do Mercado Pago
      // Isso evita fraude via simulação de webhook, garantindo que o pagamento real existe.
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo && paymentInfo.status === 'approved') {
        const mensalidadeId = paymentInfo.external_reference;

        if (!mensalidadeId) {
          return NextResponse.json({ error: 'Referência externa ausente' }, { status: 400 });
        }

        // Evitar processamento duplicado verificando se a transação já foi registrada
        const { data: trxCheck } = await supabaseAdmin
          .from('transacoes')
          .select('id')
          .eq('gateway_id', paymentId.toString())
          .maybeSingle();

        if (trxCheck) {
          return NextResponse.json({ status: 'already_processed' }, { status: 200 });
        }

        // Atualizar mensalidade de forma segura e server-side
        const { error: updateError } = await supabaseAdmin
          .from('mensalidades')
          .update({ status: 'Pago' })
          .eq('id', mensalidadeId);

        if (updateError) {
          console.error('Erro ao atualizar mensalidade:', updateError);
          return NextResponse.json({ error: 'Erro ao atualizar base de dados' }, { status: 500 });
        }

        // Criar registro na tabela transacoes para rastreabilidade fiscal/auditoria
        await supabaseAdmin
          .from('transacoes')
          .insert({
            mensalidade_id: mensalidadeId,
            gateway_id: paymentId.toString(),
            valor: paymentInfo.transaction_amount || 0,
            metodo_pagamento: paymentInfo.payment_method_id || 'UNKNOWN',
            status: 'Aprovado'
          });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no processamento do Webhook:', error);
    return NextResponse.json({ error: 'Erro interno no webhook' }, { status: 500 });
  }
}
