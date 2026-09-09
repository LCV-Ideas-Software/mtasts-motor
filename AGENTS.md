# AGENTS.md - mtasts-motor

Pointer for AI agents working in this repository.

## Project

- Repository: `https://github.com/LCV-Ideas-Software/mtasts-motor`
- App: MTA-STS Motor — Cloudflare Worker que serve politicas MTA-STS dinamicas de um D1
- Branch: `main`
- License: AGPL-3.0-or-later

## Runtime Shape

Cloudflare Worker servindo politicas MTA-STS dinamicas a partir de um D1 backing
store. Source em `src/`; deploy exclusivamente via GitHub Actions.

## Mandatory Gates

```bash
npm test
npm run lint
npm run biome
npm run typecheck
npm run format:check
npm run format:public:check
```

## Workspace Policy

The current Enterprise/Organization reform standard supersedes earlier local
governance instructions. Follow the workspace-root `AGENTS.md` directives:
official native solutions, independent repositories, Ultrabrain for substantive
reasoning and cross-review only where complexity warrants it. Do not introduce
custom gates, controllers or mandatory human/AI reviews of Dependabot PRs.
Prepare changes locally and present the complete report for operator approval
before committing, pushing or opening a PR. GitHub configuration changes require
separate explicit approval. Never change signing configuration, run Cargo/Rust
locally or use Codespaces.

This repository deploys a Worker, not an npm package or a Windows application.
Do not add GitHub Releases or version tags. Preserve the read-only D1 policy
lookup, existing Worker identity and bindings, response semantics and product
tests. The separate repository site continues to use GitHub Pages.

CI validates PRs to `main` and manual dispatches with the repository's native
tools and an official Wrangler dry run. Deploy repeats the product checks and
publishes `main` through the official Cloudflare Wrangler Action, reusing the
installed lockfile-selected CLI. Linear Release records only the exact SHA of
a successful push-triggered deployment of this repository's `main`. Preserve
the native GitHub/Linear and GitHub/Slack integrations without adding relays.

Do not restore retired `actions.lock` consumers, custom workflow/license
inventory validators, workspace-dependent markdownlint loaders, advanced CodeQL
workflows or merge queue. CodeQL uses Default Setup. Keep `THIRDPARTY.md` as a
maintained snapshot of development tooling; no npm runtime dependencies are
bundled into this Worker. Native Dependency Review is not a license-text
generator or a guarantee that future notices update automatically.

## Registro de trabalho (GitHub Projects, Issues e Discussions)

A equipe e composta por tres membros: o **operador** (humano), **Claude Code** e **ChatGPT-Codex**.
Quase todo trabalho acontece em par (operador+Claude ou operador+Codex). O que fica so no
transcript da sessao se perde para o outro membro. Por isso o registro abaixo e **obrigatorio**.

Quadro deste repositorio: `https://github.com/orgs/LCV-Ideas-Software/projects/5`
Quadro consolidado da organizacao: `https://github.com/orgs/LCV-Ideas-Software/projects/17`

### Os quatro gatilhos

**G1 — fim de bloco de trabalho.** Publique um _status update_ no quadro deste repositorio,
dizendo o que foi feito, o que ficou pendente e o que o proximo agente precisa saber:

```bash
gh api graphql -f query='
  mutation($id:ID!, $body:String!) {
    createProjectV2StatusUpdate(input:{projectId:$id, status:ON_TRACK, body:$body}) {
      statusUpdate { id }
    }
  }' -f id="$PROJECT_ID" -f body="..."
```

Use `AT_RISK` ou `OFF_TRACK` quando for o caso. O `PROJECT_ID` sai de
`gh api graphql -f query='query{organization(login:"LCV-Ideas-Software"){projectV2(number:5){id}}}'`.

**G2 — achado nao corrigido.** Todo bug, falha, limitacao de plataforma ou comportamento
inesperado que voce encontrar e **nao** resolver na hora vira issue imediatamente, com
reproducao, ambiente, evidencia, o que ja foi tentado e a hipotese de causa. Use o
formulario adequado em `.github/ISSUE_TEMPLATE/`. **Excecao de seguranca**: nenhum caso coberto
pelo reporte privado de `SECURITY.md` — nem a suspeita de um deles — vira issue
publica; siga o canal privado de la.

**G3 — decisao ou aprendizado duravel.** Criterio objetivo: _"isto seria util para quem
enfrentar este problema daqui a tres meses?"_ Se sim, vira Discussion.

- Conhecimento especifico deste repo -> Discussions **deste repositorio** (Q&A ou Ideas).
- Conhecimento transversal a varios repos (politica de release, regra de ruleset, restricao
  de plataforma) -> Discussions **da organizacao**.

**Excecao de seguranca** (tambem no G3): causa raiz, caminho de exploracao ou licao de
remediacao ligada a **qualquer caso coberto pelo reporte privado de `SECURITY.md`** nao
vira Discussion publica antes da divulgacao coordenada. Registre no canal privado de
`SECURITY.md`/advisory correspondente; apos a divulgacao, publique a versao saneada como
Discussion, sem detalhes de exploracao.
**G4 — trabalho nao-trivial.** Abra a issue **antes** do PR e referencie com `Closes #N`.
Isso ativa o fechamento automatico, o campo _Linked pull requests_ e a progressao de Status.
**Excecao de seguranca** (tambem no G4): trabalho que remedia **qualquer caso coberto
pelo reporte privado de `SECURITY.md`** — a lista de la, nao uma mais estreita: suspeita
de vulnerabilidade, vazamento de credencial, exposicao de dado privado, bypass de
autenticacao, problema em fluxo de pagamento, questao de cadeia de suprimentos ou
configuracao incorreta de deploy — nao abre issue publica nem carrega `Closes #N` de
superficie publica. O rastreio segue o canal privado do `SECURITY.md` e o advisory
correspondente; o PR referencia o advisory, sem detalhes de exploracao. Se `SECURITY.md`
mudar de escopo, vale o texto de la.

### Valvula de escape

Bump de dependencia, correcao de typo, lockfile e ajuste de formatacao **dispensam issue**.
O PR basta — ele entra no quadro sozinho quando o gatilho o alcanca; PR do Dependabot
e uma lacuna declarada do gatilho e pode depender do backfill/reconciliacao da ativacao.

### Campos

Classifique toda issue com **Type** (Task, Bug, Feature, Incident, Security, Maintenance,
Documentation, Spike) e preencha os campos de issue da organizacao **Agent** (quem esta
tocando) e **Origin** (de onde surgiu). Em Bug e Incident preencha tambem **Environment**.
Esses campos sao `ORG_ONLY`: nao aparecem para o publico, mesmo neste repositorio publico.

### Fluxo de Status no quadro

`Triagem` -> `Backlog` -> `Em andamento` -> `Em cross-review` -> `Em PR` -> `Concluido`,
com desvios `Bloqueado` e `Descartado`.

> **Invariante**: as opcoes `Triagem` e `Concluido` estao vinculadas **por ID** a workflows
> internos do GitHub que nao sao editaveis por API. Podem ser renomeadas; **nunca apagadas**.
>
> **Atualizacao por quadro**: `Status`, `Area` e `Ciclo` sao campos de projeto com IDs
> proprios em cada quadro. Atualize os DOIS quadros — o deste repositorio e o portfolio
> #17 — a cada transicao; ID de opcao de um quadro nunca vale no outro (Discussion org#176).

### Identifiers and private evidence

Non-secret resource IDs, domains and configuration metadata required by official
integrations may be versioned under the current operator policy. Credentials,
secret values, private evidence and coordinated-disclosure details must remain
in their authorized private systems, not public Issues, PRs or Discussions.
Keep the existing D1 resource identity intact; an identifier does not grant access.
