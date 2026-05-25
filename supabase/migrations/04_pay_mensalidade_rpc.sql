-- Migração 04: Função RPC para pagamento seguro (transação) de mensalidade
CREATE OR REPLACE FUNCTION public.pay_mensalidade(
    p_mensalidade_id UUID,
    p_metodo TEXT,
    p_valor NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
BEGIN
    -- 1. Obter o user_id e status da mensalidade
    SELECT user_id, status INTO v_user_id, v_status
    FROM public.mensalidades
    WHERE id = p_mensalidade_id;

    -- 2. Validar se a mensalidade existe
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Mensalidade não encontrada.';
    END IF;

    -- 3. Validar se a mensalidade pertence ao usuário autenticado (ou se é admin)
    IF v_user_id != auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Permissão negada para pagar esta mensalidade.';
    END IF;

    -- 4. Validar se já está paga
    IF v_status = 'Pago' THEN
        RETURN TRUE;
    END IF;

    -- 5. Atualizar o status da mensalidade para 'Pago'
    UPDATE public.mensalidades
    SET status = 'Pago'
    WHERE id = p_mensalidade_id;

    -- 6. Inserir o registro na tabela de transações
    INSERT INTO public.transacoes (mensalidade_id, gateway_id, valor, metodo_pagamento, status, data_pagamento)
    VALUES (p_mensalidade_id, 'MP-' || floor(random() * 1000000000)::text, p_valor, p_metodo, 'Aprovado', NOW());

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
