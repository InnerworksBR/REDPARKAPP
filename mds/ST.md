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

# PLANO DE EXECUÇÃO ATUAL

# 🎉 Todos os Ciclos de Execução Concluídos com Sucesso!

Toda a infraestrutura de dados, autenticação avançada, segurança Edge Middleware (RBAC), rotas e fluxos do mensalista e ferramentas de controle operacional/financeiro administrativo da gerência e portaria foram integradas de ponta a ponta com o **Supabase**.

## 🚀 Resumo do Projeto Finalizado

- **Ciclo 1 (Modelagem de Banco)**: Tabelas `profiles`, `veiculos`, `mensalidades`, `transacoes` criadas com triggers automatizados e políticas RLS restritivas de acesso. Storage buckets públicos e privados para veículos e avatares criados com controle de propriedade.
- **Ciclo 2 (Autenticação e Sessões)**: Cadastro unificado (Auth + Storage + BD) com modelo de veículo, login híbrido (email ou CPF), session tracker por cookies em Edge e Next.js Edge Middleware protegendo rotas privadas de `mensalista` e `admin`.
- **Ciclo 3 (Painel do Mensalista)**: Dashboard reativo paralelo, Passe Digital (ticket físico com bordas picotadas, relógio dinâmico, liberação vinculada a adimplência e upload de avatar) e Tela Financeira com Pix dinâmico, simulação de compensação atômica via Postgres RPC e escuta Realtime via WebSocket.
- **Ciclo 4 (Painel do Admin)**: Painel estatístico dinâmico da portaria (total de clientes ativos, somatório de receita projetada do mês via Postgres e contagem de inadimplentes), feed de atividades com logs em tempo real e buscador multifiltro inteligente de portaria com liberação manual de faturas presenciais.

## 🔬 Como Validar

1. **Mensalista**:
   - Cadastre-se na rota de cadastro preenchendo todos os campos, incluindo a foto do veículo.
   - O sistema gerará a mensalidade inicial. Vá até a tela "Pagar", copie a chave Pix e aguarde 3 segundos. O WebSocket atualizará reativamente a tela para "Pagamento Aprovado!".
   - Vá ao "Ticket/Passe Digital" e veja o status "Acesso Liberado" na cor verde, juntamente com a foto pessoal enviada ao bucket.

2. **Administrador**:
   - Faça login com um perfil administrador.
   - Veja as estatísticas reais consolidadas no dashboard admin e o log de atividades recentes.
   - Navegue até "Baixa Manual", busque pela placa ou nome de um mensalista que possua fatura pendente, verifique os detalhes carregados e confirme a baixa manual em dinheiro. O sistema concederá baixa imediata atualizando o status do passe do mensalista correspondente de forma instantânea.