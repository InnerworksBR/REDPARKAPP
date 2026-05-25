Você já analisou o frontend existente e gerou os arquivos `SPEC.md` e `TASKS.md`.

Agora sua próxima tarefa é ler cuidadosamente os dois arquivos e montar um plano de execução incremental para iniciar a implementação.

Antes de qualquer código, você deve obrigatoriamente consultar e usar como base:

- `SPEC.md`
- `TASKS.md`

Esses dois documentos devem ser tratados como a fonte principal de verdade do projeto.

---

# CONTEXTO TÉCNICO OBRIGATÓRIO

O projeto deve seguir estas decisões técnicas:

- O backend será implementado dentro do próprio projeto Next.js.
- Não crie um projeto separado para API.
- Utilize as rotas internas do Next.js para criar a API.
- O banco de dados será Supabase.
- A autenticação, quando necessária, deve considerar Supabase Auth ou integração compatível com Supabase.
- O gateway de pagamento será Mercado Pago.
- Todas as integrações devem respeitar a estrutura já existente do frontend.
- A implementação deve ser incremental, segura e compatível com o que já foi analisado no frontend.

---

# OBJETIVO

Com base no `SPEC.md` e no `TASKS.md`, monte um plano de execução para implementar o backend e as integrações necessárias.

O plano deve conter no máximo **3 tarefas por ciclo de execução**.

Você não deve tentar implementar muitas coisas de uma vez.

A cada plano, escolha no máximo 3 tarefas do `TASKS.md`, respeitando:

- Ordem lógica
- Dependências entre tarefas
- Prioridade
- Impacto no frontend
- Risco técnico
- Facilidade de validação

---

# REGRAS IMPORTANTES

- Leia primeiro o `SPEC.md`.
- Leia depois o `TASKS.md`.
- Referencie os dois documentos na sua resposta.
- Não ignore nenhuma dependência definida no `TASKS.md`.
- Não crie backend separado.
- Não use Express, Fastify, NestJS ou outro servidor externo.
- Não crie uma pasta fora do projeto Next.js para a API.
- Use o padrão de API do próprio Next.js.
- Use Supabase como banco de dados.
- Use Mercado Pago como gateway de pagamento.
- Não implemente código antes de apresentar o plano.
- O plano deve ter no máximo 3 tarefas.
- Cada tarefa escolhida precisa ter justificativa.
- Cada tarefa precisa indicar quais arquivos ou módulos serão alterados.
- Cada tarefa precisa ter critérios de aceite.
- Ao final, peça aprovação antes de implementar.

---

# COMO MONTAR O PLANO

Monte o plano em formato de tabela.

Use esta estrutura:

| Ordem | Task do TASKS.md | Referência no SPEC.md | Objetivo | Justificativa | Arquivos/Módulos impactados | Critérios de aceite |
|---|---|---|---|---|---|---|

## Explicação das colunas

### Ordem

Número de execução dentro deste ciclo.

Exemplo:

- 1
- 2
- 3

### Task do TASKS.md

Informe o número e o nome da tarefa conforme aparece no `TASKS.md`.

Exemplo:

`1.1 — Configurar Supabase no projeto`

### Referência no SPEC.md

Informe qual regra, entidade, endpoint ou necessidade do `SPEC.md` justifica essa tarefa.

Exemplo:

`SPEC.md — Área: Autenticação / Entidade: User / Endpoint: GET /api/users/me`

### Objetivo

Explique o que será feito nessa tarefa.

### Justificativa

Explique por que essa tarefa foi escolhida agora.

Considere:

- Dependência técnica
- Prioridade
- Necessidade do frontend
- Base para próximas tarefas
- Redução de risco

### Arquivos/Módulos impactados

Liste os arquivos, pastas ou módulos que provavelmente serão criados ou alterados.

Exemplos:

- `app/api/...`
- `app/api/auth/...`
- `app/api/checkout/...`
- `lib/supabase.ts`
- `lib/mercadopago.ts`
- `middleware.ts`
- `.env.example`
- `types/database.ts`
- `supabase/migrations/...`

### Critérios de aceite

Liste como saber se a tarefa foi concluída corretamente.

Exemplo:

- Supabase conectado com sucesso
- Variáveis de ambiente documentadas
- Endpoint responde corretamente
- Frontend consegue consumir a rota
- Erros são tratados com resposta padronizada

---

# FORMATO ESPERADO DA RESPOSTA

Use exatamente este formato:

```markdown
# Plano de execução — Ciclo 1

## Documentos usados como base

- `SPEC.md`
- `TASKS.md`

## Premissas técnicas obrigatórias

- API dentro do próprio Next.js
- Banco de dados Supabase
- Pagamentos com Mercado Pago
- Nenhum backend separado será criado

## Tarefas selecionadas para este ciclo

| Ordem | Task do TASKS.md | Referência no SPEC.md | Objetivo | Justificativa | Arquivos/Módulos impactados | Critérios de aceite |
|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |

## Observações

Liste aqui riscos, dúvidas ou pontos de atenção antes da implementação.

## Próximo passo

Peça aprovação para executar somente as tarefas deste ciclo.