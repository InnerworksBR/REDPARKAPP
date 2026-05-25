# Plano de Tarefas de Implementação - RED PARK APP

Este plano de tarefas guiará a migração completa do frontend estático (com mocks) para uma aplicação real integrada com o **Supabase**. As tarefas estão divididas em etapas lógicas e ordenadas por dependência de implementação.

---

## 🛠️ ETAPA 1: Modelagem e Infraestrutura do Banco de Dados (Supabase)

- [ ] **1.1. Tabela `profiles`**
  - [ ] Criar a tabela `profiles` com colunas: `id` (uuid, references auth.users), `nome_completo` (text), `cpf` (text, unique), `cnh` (text), `avatar_url` (text), `role` (text: 'mensalista' ou 'admin', default 'mensalista'), `created_at` (timestamptz).
  - [ ] Configurar Row Level Security (RLS) para permitir que usuários leiam seu próprio perfil e administradores leiam todos.
- [ ] **1.2. Tabela `veiculos`**
  - [ ] Criar a tabela `veiculos` com colunas: `id` (uuid, primary key), `user_id` (uuid, references profiles), `placa` (text, unique), `modelo` (text), `foto_url` (text), `created_at` (timestamptz).
  - [ ] Habilitar RLS e configurar políticas de segurança correspondentes.
- [ ] **1.3. Tabela `mensalidades`**
  - [ ] Criar a tabela `mensalidades` com colunas: `id` (uuid, primary key), `user_id` (uuid, references profiles), `valor` (numeric(10,2), default 250.00), `vencimento` (date), `status` (text: 'Pago', 'Pendente', 'Em atraso', default 'Pendente'), `created_at` (timestamptz).
  - [ ] Habilitar RLS e criar políticas.
- [ ] **1.4. Tabela `transacoes`**
  - [ ] Criar a tabela `transacoes` com colunas: `id` (uuid, primary key), `mensalidade_id` (uuid, references mensalidades), `gateway_id` (text), `valor` (numeric(10,2)), `metodo_pagamento` (text: 'PIX', 'Cartão de Crédito', 'Manual'), `status` (text: 'Aprovado', 'Pendente', 'Recusado'), `data_pagamento` (timestamptz).
- [ ] **1.5. Gatilhos de Banco (Triggers/Functions)**
  - [ ] Criar trigger `handle_new_user` para criar automaticamente um registro na tabela `profiles` ao se cadastrar em `auth.users`.
- [ ] **1.6. Supabase Storage Buckets**
  - [ ] Criar o bucket público `avatars` para fotos pessoais de perfil.
  - [ ] Criar o bucket público `vehicles` para fotos dos carros.
  - [ ] Definir políticas de acesso do storage (select público, insert/update apenas autenticado dono do arquivo).

---

## 🔐 ETAPA 2: Autenticação e Gestão de Sessões

- [ ] **2.1. Conexão e Inicialização**
  - [ ] Validar variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no arquivo `.env.local`.
- [ ] **2.2. Integração no Fluxo de Cadastro (`src/app/clientes/cadastro/page.tsx`)**
  - [ ] Substituir o `setTimeout` por chamada real ao `supabase.auth.signUp`.
  - [ ] Inserir os dados adicionais (`nome_completo`, `cpf`, `cnh`, `role`) na tabela `profiles` após o cadastro de autenticação.
  - [ ] Realizar upload da foto do carro para o storage bucket `vehicles` e salvar o registro na tabela `veiculos` vinculado ao `user_id`.
  - [ ] Criar registro inicial da mensalidade atual como "Pendente" para o novo mensalista.
- [ ] **2.3. Integração no Fluxo de Login (`src/app/clientes/login/page.tsx`)**
  - [ ] Substituir lógica mockada por `supabase.auth.signInWithPassword`.
  - [ ] Obter o perfil do usuário logado na tabela `profiles` para ler o campo `role`.
  - [ ] Redirecionar condicionalmente baseando-se no `role` real do banco (se 'admin' redirecionar para `/admin/dashboard`, se 'mensalista' para `/dashboard`).
- [ ] **2.4. Proteção de Rotas e Middleware**
  - [ ] Criar Middleware do Next.js para proteger as rotas da área de mensalista (`/(mensalista)/*`) e admin (`/(admin)/*`), garantindo que usuários não autorizados sejam redirecionados ao login.

---

## 🚗 ETAPA 3: Fluxos do Mensalista (Área Logada)

- [ ] **3.1. Dashboard Dinâmico (`src/app/(mensalista)/dashboard/page.tsx`)**
  - [ ] Buscar o perfil, os dados do veículo e a mensalidade vigente do mensalista logado usando `supabase.auth.getUser()`.
  - [ ] Substituir dados mockados de nome, placa, modelo, status e vencimento pelos dados retornados do Supabase.
- [ ] **3.2. Tela de Pagamento Real (`src/app/(mensalista)/pagamento/page.tsx`)**
  - [ ] Exibir dinamicamente a mensalidade pendente recuperada do banco de dados.
  - [ ] Conectar o botão Pix a uma integração simulada (ou real) que atualiza o registro da mensalidade para `Pago` e insere o log em `transacoes`.
  - [ ] Habilitar escuta em tempo real (Supabase Realtime) na tela para atualizar o layout assim que o pagamento for detectado.
- [ ] **3.3. Passe Digital e Upload de Foto (`src/app/(mensalista)/checkin/page.tsx`)**
  - [ ] Carregar a foto pessoal (avatar_url) a partir da tabela `profiles` e os dados do veículo a partir de `veiculos`.
  - [ ] Substituir a lógica de liberação: o acesso só será "Liberado" se não existirem mensalidades "Pendente" ou "Em atraso" no perfil do usuário.
  - [ ] Fazer o upload de imagem real ao selecionar a foto pessoal no passe digital, salvando no bucket `avatars` e atualizando o campo `avatar_url` em `profiles`.

---

## 👑 ETAPA 4: Fluxos Administrativos (Área Logada Admin)

- [ ] **4.1. Estatísticas Consolidadas (`src/app/(admin)/admin/dashboard/page.tsx`)**
  - [ ] Obter a contagem total de mensalistas ativos na tabela `profiles`.
  - [ ] Somar o valor de todas as mensalidades cujo vencimento é no mês atual para o card "Receita Prevista".
  - [ ] Contar o total de mensalistas que possuem mensalidades no status "Em atraso" para o card "Inadimplentes".
  - [ ] Buscar a lista histórica de transações e renderizar em "Últimas Atividades".
- [ ] **4.2. Baixa Manual de Faturas (`src/app/(admin)/admin/baixa/page.tsx`)**
  - [ ] Implementar a busca dinâmica no banco de dados na barra de busca (pesquisando por placa na tabela `veiculos` e por CPF ou nome na tabela `profiles`).
  - [ ] Apresentar os dados reais da mensalidade pendente encontrada.
  - [ ] Ao clicar em "Confirmar Pagamento", executar uma transação (RPC ou update seguro) atualizando o status da mensalidade para "Pago" e inserindo um registro na tabela `transacoes` com método de pagamento "Manual".
