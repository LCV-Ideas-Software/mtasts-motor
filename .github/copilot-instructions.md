

## 📋 DIRETIVAS DO PROJETO E REGRAS DE CÓDIGO
# Regras
- Use princípios de Clean Code.
- Comente lógicas complexas.


## 🧠 MEMÓRIA DE CONTEXTO ISOLADO (MTASTS-MOTOR)
## 2026-04-10 — Biome 2.x + ESM + wrangler local (v02.00.03)
- Biome 2.x adicionado (lint + format com organizeImports)
- Module type: commonjs → module (ESM)
- wrangler adicionado ao devDependencies (antes global)
- @cloudflare/workers-types atualizado para 4.20260411
- Dependabot groups: @vitest/* e @biomejs/* adicionados

# AI Memory Log

## 2026-04-17 — MTASTS-Motor v02.00.05 (wrangler observability + traces)
### Escopo
Padronização do baseline de observabilidade Cloudflare no `mtasts-motor`.
### Alterado
- `wrangler.json` agora garante `observability.logs.enabled = true`, `observability.logs.invocation_logs = true` e `observability.traces.enabled = true`.
- `src/index.ts` recebeu limpeza de lint/TypeScript (`template literal`, `optional chaining` e contexto `_ctx`) para manter o gate local verde no fechamento.
### Motivação
- Alinhar o worker ao padrão operacional do workspace para logs de invocação e traces.
### Versão
- APP v02.00.04 → APP v02.00.05


## 2026-04-08 — GitHub Actions Purge & Dependabot Standardization
### Escopo
Auditoria completa de CI/CD para eliminação de "ghost runs" em toda a rede de repositórios do workspace, juntamente com a universalização da configuração do Dependabot ajustada às necessidades de empacotamento locais para mitigar tráfego e limites no API.


> **DIRETIVA DE SEGURANÇA:** Ao sugerir código ou responder perguntas, leia rigorosamente o contexto e as memórias históricas acima para não divergir das decisões já tomadas pelo outro agente.
