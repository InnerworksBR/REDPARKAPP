-- Migração 03: Criação de tabelas financeiras, funções de apoio e políticas RLS de controle de faturamento

-- 1. Função auxiliar para verificar privilégio de Administrador nas políticas de RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criação da tabela de mensalidades
CREATE TABLE IF NOT EXISTS public.mensalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    valor NUMERIC(10,2) NOT NULL DEFAULT 250.00,
    vencimento DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CONSTRAINT chk_status_mensalidade CHECK (status IN ('Pago', 'Pendente', 'Em atraso')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitação de RLS para mensalidades
ALTER TABLE public.mensalidades ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS para mensalidades
CREATE POLICY "Mensalistas podem ler suas próprias faturas"
    ON public.mensalidades FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Administradores possuem controle total sobre faturas"
    ON public.mensalidades FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Criação da tabela de logs de transações
CREATE TABLE IF NOT EXISTS public.transacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensalidade_id UUID NOT NULL REFERENCES public.mensalidades(id) ON DELETE CASCADE,
    gateway_id TEXT, -- ID de referência do gateway (ex: ID Mercado Pago)
    valor NUMERIC(10,2) NOT NULL,
    metodo_pagamento TEXT NOT NULL CONSTRAINT chk_metodo CHECK (metodo_pagamento IN ('PIX', 'Cartão de Crédito', 'Manual')),
    status TEXT NOT NULL DEFAULT 'Pendente' CONSTRAINT chk_status_transacao CHECK (status IN ('Aprovado', 'Pendente', 'Recusado')),
    data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Habilitação de RLS para transações
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de RLS para transações
CREATE POLICY "Mensalistas podem visualizar suas próprias transações"
    ON public.transacoes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.mensalidades m
            WHERE m.id = transacoes.mensalidade_id AND m.user_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "Administradores possuem controle total sobre transações"
    ON public.transacoes FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
