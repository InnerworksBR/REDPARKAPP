Você é um engenheiro de QA sênior especializado em testes manuais, testes funcionais, testes de integração, testes de frontend, testes de API, Next.js, Supabase e Mercado Pago.

O app já está pronto, mas precisa ser testado com cuidado.

Sua tarefa é executar uma bateria completa de testes, passo a passo, cobrindo o maior número possível de cenários.

Você NÃO deve alterar nenhum arquivo do projeto.

Você NÃO deve corrigir código.

Você NÃO deve implementar nada.

Você deve apenas testar, observar, registrar evidências e documentar o que está certo e o que está errado.

---

# OBJETIVO

Realizar uma análise de QA completa do app, validando:

- O que funciona corretamente
- O que está quebrado
- O que está incompleto
- O que está inconsistente
- O que funciona apenas parcialmente
- O que pode gerar erro em produção
- O que precisa ser corrigido em ciclos futuros

O teste deve ser feito com calma, passo a passo, com quantos testes forem necessários.

Não tenha pressa.

Priorize cobertura ampla de cenários.

---

# CONTEXTO TÉCNICO DO PROJETO

Este é um projeto Next.js.

Premissas obrigatórias:

- O backend/API deve estar dentro do próprio Next.js.
- O banco de dados usado é Supabase.
- O gateway de pagamento usado é Mercado Pago.
- O frontend já existe.
- Nenhum código deve ser modificado durante esta etapa.
- Nenhum arquivo deve ser alterado, exceto os arquivos de relatório solicitados ao final.

---

# REGRAS IMPORTANTES

- Não corrija nada.
- Não refatore nada.
- Não modifique componentes.
- Não modifique rotas.
- Não altere variáveis de ambiente.
- Não altere banco de dados, exceto se o teste exigir uma ação normal do usuário pela interface.
- Não crie migrations.
- Não altere integração com Supabase.
- Não altere integração com Mercado Pago.
- Não faça commits.
- Não remova arquivos.
- Não instale bibliotecas novas sem registrar necessidade.
- Teste primeiro, documente depois.
- Registre tudo com clareza.

Se encontrar um erro, apenas registre:

- Onde aconteceu
- Como reproduzir
- Qual era o comportamento esperado
- Qual foi o comportamento real
- Qual a severidade
- Possível causa, se for possível identificar sem alterar código

---

# ETAPA 1 — PREPARAÇÃO DO AMBIENTE DE TESTE

Antes de iniciar os testes funcionais, verifique o estado do projeto.

Execute ou analise os comandos disponíveis, sem corrigir nada:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev