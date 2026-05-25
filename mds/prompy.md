Você é um arquiteto de software sênior, especialista em análise de frontend, backend, banco de dados, APIs, autenticação, regras de negócio e planejamento técnico.

O frontend do projeto já está clonado e aberto no ambiente.  
Sua primeira tarefa é analisar cuidadosamente o frontend existente antes de propor qualquer implementação.

Não implemente código neste momento.

---

# OBJETIVO

Analise o frontend já existente, entenda as telas, fluxos, componentes, formulários, estados, dados mockados, regras de negócio e necessidades de backend.

Com base nessa análise, crie os arquivos:

- `SPEC.md`
- `TASKS.md`

Porém, todo o conteúdo principal deve ser organizado em **uma única tabela central**, clara, detalhada e numerada.

---

# ETAPA 1 — ANALISAR O FRONTEND EXISTENTE

Antes de escrever os arquivos, analise:

- Estrutura de pastas
- Rotas e páginas
- Componentes principais
- Formulários
- Campos utilizados
- Dados exibidos
- Dados mockados
- Estados da aplicação
- Fluxos de navegação
- Regras de negócio implícitas
- Regras de validação
- Tipos de usuários, permissões ou papéis
- Funcionalidades que dependem de backend
- Possíveis chamadas de API
- Entidades principais do sistema
- Integrações externas necessárias

Sempre que encontrar algo importante, relacione com o arquivo, página ou componente onde foi identificado.

Se algo não estiver claro, registre como hipótese, dúvida ou ponto de atenção.

---

# ETAPA 2 — CRIAR O ARQUIVO SPEC.md

Crie um arquivo chamado `SPEC.md`.

O conteúdo deve conter uma breve introdução e depois uma única tabela principal.

A tabela deve ter as seguintes colunas:

| Nº | Área | Item identificado | Origem no frontend | Regra de negócio / necessidade | Impacto no backend | Entidade relacionada | Endpoint/API sugerido | Banco de dados / persistência | Validações | Permissões | Observações |
|---|---|---|---|---|---|---|---|---|---|---|---|

## Explicação das colunas

### Nº
Numeração sequencial do item.

Exemplo:

- 1
- 2
- 3

### Área
Categoria do item analisado.

Exemplos:

- Autenticação
- Usuários
- Dashboard
- Produtos
- Pedidos
- Pagamentos
- Agendamentos
- Configurações
- Relatórios
- Integrações
- Segurança
- Banco de dados

### Item identificado
Nome da funcionalidade, tela, regra ou necessidade encontrada.

### Origem no frontend
Informe onde isso foi encontrado.

Exemplos:

- `src/pages/Login.tsx`
- `src/components/ProductCard.tsx`
- `src/routes/AppRoutes.tsx`
- `src/mocks/orders.ts`
- Tela de cadastro
- Formulário de checkout

### Regra de negócio / necessidade
Explique a regra ou necessidade identificada no frontend.

Exemplo:

“O usuário precisa informar e-mail e senha para acessar áreas protegidas.”

### Impacto no backend
Explique o que o backend precisará fazer para atender essa regra.

Exemplo:

“Criar autenticação com validação de credenciais, geração de token JWT e middleware de proteção de rotas.”

### Entidade relacionada
Informe a entidade principal envolvida.

Exemplos:

- User
- Product
- Order
- Payment
- Customer
- Schedule
- Category

### Endpoint/API sugerido
Informe os endpoints necessários.

Exemplo:

```http
POST /auth/login
GET /users/me
POST /products
GET /orders