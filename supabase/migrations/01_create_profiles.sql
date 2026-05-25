-- Migração 01: Criação da tabela profiles e gatilho de sincronização de novos usuários

-- 1. Criação da tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    cnh TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'mensalista' CONSTRAINT chk_role CHECK (role IN ('mensalista', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitação de RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criação de Políticas de RLS
-- Qualquer usuário autenticado ou visitante pode ler perfis (necessário para buscas no admin e exibição)
CREATE POLICY "Permitir leitura pública de perfis"
    ON public.profiles FOR SELECT
    USING (true);

-- Um usuário só pode atualizar seu próprio perfil
CREATE POLICY "Permitir atualização do próprio perfil"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Função gatilho para auto-registro a partir de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nome_completo, cpf, cnh, email, role, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'nome_completo', ''),
        COALESCE(new.raw_user_meta_data->>'cpf', ''),
        COALESCE(new.raw_user_meta_data->>'cnh', ''),
        new.email,
        COALESCE(new.raw_user_meta_data->>'role', 'mensalista'),
        NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Configuração do Trigger de criação de usuário
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
