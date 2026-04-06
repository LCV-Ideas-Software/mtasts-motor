# Changelog — MTA-STS Server

## [v02.00.01] — 2026-04-06
### Alterado
- **Observability 100%**: `head_sampling_rate: 1`, `invocation_logs: true` e `logs.enabled: true` ativados no `wrangler.json`.

### Controle de versão
- `mta-sts-server`: v02.00.00 → v02.00.01

## [v02.00.00] — 2026-04-02
### Alterado
- **Arquitetura D1**: Renomeação da tabela acessada para `mtasts_mta_sts_policies`, permitindo o acesso direto aos dados consolidados pelo Admin-App.
- **Ecossistema Workspace**: Adicionado suporte TypeScript nativo, `wrangler.json`, e diretivas do repositório para deployment automático de CI.

### Corrigido
- Exceções e erros sendo mascarados de instabilidade na consulta agora são expostos no terminal usando padronização Compliance de tipo de execeção (`error instanceof Error`).
