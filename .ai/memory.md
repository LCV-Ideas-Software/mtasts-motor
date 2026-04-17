## 2026-04-17 — MTASTS-Motor v02.00.07 (workers.dev desativado após validação Cloudflare)
### Escopo
Hardening de exposição pública do `mtasts-motor` após validação do topology real no runtime da Cloudflare.
### Alterado
- `wrangler.json` agora define `workers_dev: false`.
- A validação ao vivo confirmou 11 custom domains ativos `mta-sts.*` ligados ao `mtasts-motor` e nenhum route clássico, tornando a URL `mtasts-motor.lcv.workers.dev` dispensável.
### Motivação
- Reduzir a superfície pública do Worker sem perder os hostnames produtivos já configurados no runtime da Cloudflare.
### Versão
- APP v02.00.06 → APP v02.00.07

## 2026-04-17 — MTASTS-Motor v02.00.06 (hardening de superfície HTTP + testes + CI real)
### Escopo
Fechamento corretivo do `mtasts-motor` após auditoria rigorosa de segurança, bugs, fragilidades operacionais e upgrades tecnológicos.
### Alterado
- `src/index.ts` passou a rejeitar métodos diferentes de `GET`/`HEAD`, removeu a exposição do `APP_VERSION` em `404` e deixou de enviar `Cache-Control` próprio.
- `src/index.test.ts` cobre os caminhos `405`, `404`, `400`, `404 sem policy`, `200` e `500`.
- `.github/workflows/deploy.yml` agora executa `npm audit --audit-level=high`, `npm run lint`, `npm run typecheck` e `npm test` antes do deploy, usando o `wrangler` versionado no repositório em vez de `wrangler@latest`.
- Tooling atualizado: `@biomejs/biome` `2.4.11 -> 2.4.12`, `@cloudflare/workers-types` `4.20260411.1 -> 4.20260417.1`, `typescript` `6.0.2 -> 6.0.3`, `wrangler` `4.81.1 -> 4.83.0`, com `vitest` adicionado.
- `README.md` e `SECURITY.md` foram realinhados ao comportamento real do Worker e aos controles de segurança efetivamente verificáveis no repo privado.
### Motivação
- Remover drift entre validação local e deploy, reduzir superfície HTTP desnecessária e tornar o Worker verificável por testes e gates automáticos.
### Versão
- APP v02.00.05 → APP v02.00.06

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
## 2026-04-10 — Biome 2.x + ESM + wrangler local (v02.00.03)
- Biome 2.x adicionado (lint + format com organizeImports)
- Module type: commonjs → module (ESM)
- wrangler adicionado ao devDependencies (antes global)
- @cloudflare/workers-types atualizado para 4.20260411
- Dependabot groups: @vitest/* e @biomejs/* adicionados

# AI Memory Log

## 2026-04-08 — GitHub Actions Purge & Dependabot Standardization
### Escopo
Auditoria completa de CI/CD para eliminação de "ghost runs" em toda a rede de repositórios do workspace, juntamente com a universalização da configuração do Dependabot ajustada às necessidades de empacotamento locais para mitigar tráfego e limites no API.
