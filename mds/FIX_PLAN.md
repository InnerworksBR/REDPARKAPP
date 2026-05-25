# FIX_PLAN.md

# Plano de correção incremental

## 1. Objetivo

Este plano corrige os problemas encontrados no `QA_REPORT.md` de forma incremental, segura e testável.

## 2. Premissas técnicas

- API dentro do próprio Next.js
- Rotas em `app/api`
- Banco de dados Supabase
- Gateway Mercado Pago
- Nenhum backend separado
- Correções em ciclos de no máximo 3 tarefas
- Preservação do frontend existente

## 3. Problemas do QA considerados

| Nº | Problema do QA | Severidade | Área | Estratégia de correção |
|---|---|---|---|---|
| 1 | Pagamento falso/mockado | Crítica | Mercado Pago / Checkout | Substituir mock por fluxo real com API interna e webhook |
| 2 | Ausência de `app/api` | Alta | Arquitetura | Criar route handlers internos no Next.js |
| 3 | RPC de pagamento no client | Alta | Segurança | Mover confirmação de pagamento para webhook/server-side |
| 4 | Banco acessado diretamente no frontend para ações sensíveis | Alta | Segurança | Manter leitura simples no client quando seguro, mas mover ações críticas para API |
| 5 | Script `typecheck` ausente | Baixa | Configuração | Adicionar script `typecheck` no `package.json` |

## 4. Ciclos de correção

### Ciclo 1 — Base segura para API e configuração

| Ordem | Tarefa | Problema do QA relacionado | Objetivo | Arquivos impactados | Critérios de aceite | Status |
|---|---|---|---|---|---|---|
| 1 | Criar estrutura inicial de API interna | Ausência de `app/api` | Criar base para rotas server-side no Next.js | `app/api/health/route.ts` ou equivalente | Endpoint interno responde corretamente | Concluído |
| 2 | Criar utilitário server-side do Supabase | Lógica sensível no client | Preparar acesso seguro ao Supabase no servidor | `lib/supabase/server.ts` ou equivalente | Client server-side usa variáveis corretas e não expõe chave privada no frontend | Concluído |
| 3 | Adicionar script de typecheck | Script ausente | Permitir validação de TypeScript | `package.json` | `npm run typecheck` executa `tsc --noEmit` | Concluído |

### Ciclo 2 — Preparação da integração Mercado Pago

| Ordem | Tarefa | Problema do QA relacionado | Objetivo | Arquivos impactados | Critérios de aceite | Status |
|---|---|---|---|---|---|---|
| 1 | Criar configuração server-side do Mercado Pago | Integração Mercado Pago ausente | Centralizar SDK/token no servidor | `lib/mercadopago.ts` | Access token não aparece no client | Concluído |
| 2 | Criar rota para gerar preferência de pagamento | Pagamento mockado | Permitir criação real de checkout | `app/api/mercadopago/preference/route.ts` | Rota cria preferência ou retorna erro controlado | Concluído |
| 3 | Ajustar página de pagamento para chamar API interna | Mock no frontend | Remover aprovação falsa por `setTimeout` | `app/(mensalista)/pagamento/page.tsx` | Frontend chama API interna e não aprova pagamento sozinho | Concluído |

### Ciclo 3 — Webhook e confirmação server-side

| Ordem | Tarefa | Problema do QA relacionado | Objetivo | Arquivos impactados | Critérios de aceite | Status |
|---|---|---|---|---|---|---|
| 1 | Criar webhook do Mercado Pago | Ausência de webhook | Receber notificações reais de pagamento | `app/api/mercadopago/webhook/route.ts` | Webhook recebe notificação e valida dados básicos | Concluído |
| 2 | Atualizar mensalidade somente pelo servidor | RPC no client | Remover confirmação de pagamento do frontend | API/webhook + Supabase | Mensalidade só muda para pago após confirmação server-side | Concluído |
| 3 | Persistir dados do pagamento | Falta rastreabilidade | Registrar payment_id, status e payload mínimo | Tabelas Supabase / rota webhook | Pagamento fica auditável | Concluído |

### Ciclo 4 — Retestes e endurecimento de segurança

| Ordem | Tarefa | Problema do QA relacionado | Objetivo | Arquivos impactados | Critérios de aceite | Status |
|---|---|---|---|---|---|---|
| 1 | Revisar validações das APIs | Segurança | Bloquear payloads inválidos | `app/api/**/route.ts` | APIs retornam 400 para dados inválidos | Concluído |
| 2 | Revisar exposição de variáveis | Segurança | Garantir que tokens privados não vão ao client | `.env.example`, libs server-side | Nenhuma chave privada exposta | Concluído |
| 3 | Executar retestes do QA | QA | Validar correções | `QA_REPORT.md`, `RETEST_PLAN.md` | Problemas críticos corrigidos ou documentados | Concluído |
