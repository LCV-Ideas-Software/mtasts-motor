# mtasts-motor

> Motor Cloudflare Worker responsável por gerenciar e responder políticas de MTA-STS para os domínios do grupo, além de centralização e rotina para os relatórios TLS-RPT de e-mail compliance.

## Ecossistema LCV Workspace

Este repositório faz parte do workspace global LCV / Reflexos da Alma e opera de modo integrado aos demais serviços.

## Arquitetura & Governança

- **Cloudflare**: Implementado utilizando Workers/Pages, KV, D1, e integrações nativas como AI Gateway.
- **Padrões de Qualidade**: Obedece estritamente às diretivas de `AGENTS.md` e regras de paridade contidas no `.ai/GEMINI.md` e `.github/copilot-instructions.md`.
- **Yolo Mode & AI Automation**: O desenvolvimento deve priorizar o uso dos MCPs `ultrathink` e `code-reasoning` para planejamento.

---
*Documentação gerada e sincronizada para o Workspace LCV.*