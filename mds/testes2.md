Você executou a etapa de QA, mas interrompeu os testes porque o ambiente não possui `node` e `npm` configurados no `PATH`.

Isso não deve bloquear a revisão.

Sua tarefa continua sendo testar e auditar o projeto SEM alterar nada.

Importante: foi identificado que 1 arquivo foi alterado durante a tentativa anterior. Antes de continuar, verifique qual arquivo foi modificado e explique exatamente o que mudou. Se a alteração foi apenas nos relatórios de QA, informe. Se qualquer arquivo do app foi alterado, registre como violação da regra de QA.

---

# NOVA INSTRUÇÃO

Continue a revisão de QA mesmo sem conseguir executar comandos como:

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`

Caso esses comandos não estejam disponíveis, registre no relatório como:

- Ambiente de execução indisponível
- Testes runtime não executados
- Bloqueio por ausência de Node.js/npm no PATH

Mas NÃO pare o trabalho.

---

# O QUE FAZER AGORA

Você deve continuar com uma análise estática completa do projeto.

Analise os arquivos do projeto diretamente, incluindo:

- Estrutura de pastas
- `package.json`
- Configurações do Next.js
- Arquivos `.env.example` ou similares
- Rotas do App Router
- Rotas em `app/api`
- Componentes React
- Hooks
- Server Components e Client Components
- Imports e exports
- Chamadas para APIs internas
- Integração com Supabase
- Integração com Mercado Pago
- Fluxos de autenticação
- Fluxos de checkout
- Formulários
- Validações
- Tipagens TypeScript
- Uso de variáveis de ambiente
- Possíveis chaves sensíveis expostas
- Dados mockados ainda em uso
- Chamadas para endpoints inexistentes
- Possíveis erros de build por análise de código

---

# REGRA PRINCIPAL

Você NÃO deve modificar nenhum arquivo do app.

Você pode criar ou atualizar apenas os arquivos de relatório:

- `QA_REPORT.md`
- `RETEST_PLAN.md`

Não corrija código.

Não refatore.

Não instale dependências.

Não altere configuração.

Não altere `.env`.

Não altere componentes.

Não altere APIs.

Apenas teste, analise e documente.

---

# TESTES QUE DEVEM SER FEITOS MESMO SEM RODAR O APP

## 1. Auditoria de estrutura

Verifique se o projeto está coerente com Next.js:

- Existe `app/` ou `pages/`
- Existe `app/api`
- As APIs estão dentro do próprio Next.js
- Não existe backend separado
- O projeto não mistura indevidamente backend externo com Next.js

## 2. Auditoria do `package.json`

Verifique:

- Scripts existentes
- Dependências principais
- Versão do Next.js
- Dependências de Supabase
- Dependências de Mercado Pago
- Dependências ausentes
- Scripts de build/lint/typecheck

## 3. Auditoria de rotas

Liste todas as páginas encontradas.

Para cada página, registre:

- Caminho provável da rota
- Arquivo de origem
- Se depende de dados externos
- Se parece completa ou incompleta
- Possíveis erros encontrados

## 4. Auditoria de API interna

Liste todas as rotas em `app/api`.

Para cada endpoint, registre:

- Método HTTP suportado
- Arquivo
- O que ele faz
- Payload esperado, se identificável
- Integração com Supabase
- Integração com Mercado Pago
- Possíveis problemas de validação
- Possíveis problemas de segurança
- Possíveis problemas de retorno para o frontend

## 5. Auditoria de Supabase

Verifique:

- Onde o Supabase client é criado
- Se existe separação entre client público e server/admin
- Se `SUPABASE_SERVICE_ROLE_KEY` aparece em arquivo client
- Se as variáveis públicas usam `NEXT_PUBLIC_`
- Se queries possuem tratamento de erro
- Se há expectativa de tabelas sem documentação
- Se há risco de RLS bloquear o app
- Se há operações sensíveis sem autenticação

## 6. Auditoria de Mercado Pago

Verifique:

- Onde o Mercado Pago é configurado
- Se o access token está protegido
- Se há criação de preferência
- Se existe webhook
- Se o webhook valida origem/notificação
- Se status de pagamento é persistido
- Se o frontend depende de retorno correto do pagamento
- Se há risco de pagamento aprovado não atualizar pedido

## 7. Auditoria de frontend

Verifique:

- Componentes com imports quebrados
- Uso incorreto de hooks
- Falta de `use client` em componentes interativos
- Uso desnecessário de `use client`
- Chamadas para endpoints inexistentes
- Formulários sem validação
- Botões sem ação
- Fluxos incompletos
- Dados mockados
- Estados de loading ausentes
- Estados de erro ausentes
- Problemas de responsividade identificáveis pelo código

## 8. Auditoria de segurança

Verifique:

- Chaves privadas expostas
- Tokens em código client
- APIs sem autenticação
- Rotas administrativas sem proteção
- Falta de validação no backend
- Dados sensíveis retornados para o frontend
- Possibilidade de manipular IDs manualmente
- Falta de checagem de dono do recurso

---

# FORMATO DO QA_REPORT.md

Atualize ou crie o arquivo `QA_REPORT.md` com este formato:

```markdown
# QA_REPORT.md

# Relatório de QA do app

## 1. Resumo geral

Descreva o estado geral do projeto.

Informe claramente:

- Testes de runtime não puderam ser executados porque Node.js/npm não estão disponíveis no PATH
- A análise continuou de forma estática
- Nenhum arquivo do app foi alterado
- Se algum arquivo foi alterado anteriormente, informe qual foi

## 2. Estado do ambiente

| Nº | Verificação | Resultado | Impacto | Observações |
|---|---|---|---|---|
| 1 | Node.js disponível | Passou/Falhou | Impacto | Observação |
| 2 | npm disponível | Passou/Falhou | Impacto | Observação |
| 3 | Scripts do projeto | Passou/Falhou/Não testado | Impacto | Observação |

## 3. Arquivo alterado anteriormente

| Nº | Arquivo | Tipo de alteração | É arquivo do app? | Impacto | Observações |
|---|---|---|---|---|---|

## 4. Tabela geral de QA estático

| Nº | Área | Item analisado | Arquivo/Local | Resultado esperado | Resultado encontrado | Status | Severidade | Impacto | Recomendação |
|---|---|---|---|---|---|---|---|---|---|

## 5. Rotas/páginas encontradas

| Nº | Rota provável | Arquivo | Função da página | Dependências | Status | Observações |
|---|---|---|---|---|---|---|

## 6. APIs internas encontradas

| Nº | Método | Endpoint provável | Arquivo | Função | Integrações | Problemas encontrados | Severidade |
|---|---|---|---|---|---|---|---|

## 7. Supabase

| Nº | Item | Arquivo | Resultado | Risco | Recomendação |
|---|---|---|---|---|---|

## 8. Mercado Pago

| Nº | Item | Arquivo | Resultado | Risco | Recomendação |
|---|---|---|---|---|---|

## 9. Problemas críticos e altos

| Nº | Problema | Área | Severidade | Como identificar | Impacto | Recomendação |
|---|---|---|---|---|---|---|

## 10. O que está certo

Liste o que parece estar corretamente implementado.

## 11. O que está errado

Liste os problemas encontrados.

## 12. O que não pôde ser testado

Liste os testes que dependem de runtime, navegador, banco real, Mercado Pago sandbox ou credenciais.

## 13. Recomendação final

Classifique o app como:

- Aprovado para produção
- Aprovado com ressalvas
- Reprovado para produção no estado atual
- Inconclusivo por ausência de ambiente runtime

Justifique.