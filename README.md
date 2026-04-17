# mtasts-motor

> Worker Cloudflare responsável por servir dinamicamente políticas de MTA-STS para os domínios do grupo a partir da tabela `mtasts_mta_sts_policies` no `BIGDATA_DB`.

## Ecossistema LCV Workspace

Este repositório faz parte do workspace global LCV / Reflexos da Alma e opera de modo integrado aos demais serviços.

## Arquitetura & Governança

- **Cloudflare**: Implementado utilizando Workers/Pages, KV, D1, e integrações nativas como AI Gateway.
- **Padrões de Qualidade**: Obedece estritamente às diretivas de `AGENTS.md` e regras de paridade contidas no `.ai/GEMINI.md` e `.github/copilot-instructions.md`.
- **Yolo Mode & AI Automation**: O desenvolvimento deve priorizar o uso dos MCPs `ultrathink` e `code-reasoning` para planejamento.

## Superfície HTTP

- **Endpoint suportado**: `GET` e `HEAD` em `/.well-known/mta-sts.txt`
- **Lookup de política**: resolve o domínio raiz a partir de `mta-sts.<dominio>` e consulta `mtasts_mta_sts_policies`
- **Resposta**: `text/plain; charset=utf-8`

---
*Documentação gerada e sincronizada para o Workspace LCV.*
