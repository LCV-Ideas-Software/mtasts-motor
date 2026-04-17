# Changelog — MTA-STS Motor

## [v02.00.05] - 2026-04-17
### Alterado
- `wrangler.json` passou a declarar explicitamente `observability.logs.enabled = true`, `observability.logs.invocation_logs = true` e `observability.traces.enabled = true`.
- `src/index.ts` recebeu limpeza de lint/TypeScript (`template literal`, `optional chaining` e contexto `_ctx`) para manter o gate local verde no fechamento.
### Motivação
- Alinhar o baseline de telemetria Cloudflare do `mtasts-motor` ao padrão operacional do workspace.


## [v02.00.04] - 2026-04-11
### Alterado
- **Log prefix**: `console.error` prefixado com `[mtasts-motor]` para observabilidade unificada.

## [v02.00.03] - 2026-04-10
### Adicionado
- **Biome 2.x**: lint + format com organizeImports
- **wrangler local**: adicionado ao devDependencies (antes dependia de instalação global)

### Alterado
- **ESM**: module type mudado de commonjs para module
- **@cloudflare/workers-types**: atualizado para 4.20260411
- **Dependabot groups**: @vitest/* e @biomejs/* adicionados

## [v02.00.02] — 2026-04-06
### Alterado
- **Full Rename**: Worker renomeado de `mta-sts-server` para `mtasts-motor` em `wrangler.json`, `package.json`, `README.md`, código fonte e repositório GitHub.
- **Compatibility Date**: `wrangler.json` atualizado para `2026-04-06`.
### Controle de versão
- `mtasts-motor`: v02.00.01 → v02.00.02


## [v02.00.01] — 2026-04-06
### Alterado
- **Observability 100%**: `head_sampling_rate: 1`, `invocation_logs: true` e `logs.enabled: true` ativados no `wrangler.json`.

### Controle de versão
- `mtasts-motor`: v02.00.00 → v02.00.01

## [v02.00.00] — 2026-04-02
### Alterado
- **Arquitetura D1**: Renomeação da tabela acessada para `mtasts_mta_sts_policies`, permitindo o acesso direto aos dados consolidados pelo Admin-App.
- **Ecossistema Workspace**: Adicionado suporte TypeScript nativo, `wrangler.json`, e diretivas do repositório para deployment automático de CI.

### Corrigido
- Exceções e erros sendo mascarados de instabilidade na consulta agora são expostos no terminal usando padronização Compliance de tipo de execeção (`error instanceof Error`).
