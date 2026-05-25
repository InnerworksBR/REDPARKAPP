-- Migração 02: Criação da tabela veiculos e infraestrutura de storage (buckets e políticas)

-- 1. Criação da tabela de veículos
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    placa TEXT UNIQUE NOT NULL,
    modelo TEXT NOT NULL,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitação de RLS (Row Level Security)
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de RLS para veículos
CREATE POLICY "Permitir leitura de veículos por qualquer usuário"
    ON public.veiculos FOR SELECT
    USING (true);

CREATE POLICY "Permitir que o usuário insira seu próprio veículo"
    ON public.veiculos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir que o usuário atualize seu próprio veículo"
    ON public.veiculos FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir que o usuário remova seu próprio veículo"
    ON public.veiculos FOR DELETE
    USING (auth.uid() = user_id);

-- 4. Criação dos Buckets de Armazenamento no Supabase (se não existirem)
-- O schema `storage` controla buckets e arquivos no Supabase
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('vehicles', 'vehicles', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Políticas de RLS para upload de arquivos em storage.objects
-- Nota: A estrutura de pastas recomendada é <bucket_id>/<user_id>/nome_do_arquivo.ext
CREATE POLICY "Permitir leitura pública de imagens"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('vehicles', 'avatars'));

CREATE POLICY "Permitir upload de fotos de veículos e avatars apenas pelo proprietário"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('vehicles', 'avatars') 
        AND (auth.uid()::text = (storage.foldername(name))[1])
    );

CREATE POLICY "Permitir exclusão de fotos apenas pelo proprietário"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('vehicles', 'avatars') 
        AND (auth.uid()::text = (storage.foldername(name))[1])
    );
