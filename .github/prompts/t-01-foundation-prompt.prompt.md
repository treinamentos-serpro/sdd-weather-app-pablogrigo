---
mode: agent
description: 'Implementa e valida a tarefa T-01: confirmação da fundação de desenvolvimento.'
---

# Prompt — T-01: Confirmar a fundação de desenvolvimento

Você é o **Coding Agent** do SDD Weather App. Execute somente a tarefa `T-01`
do backlog e deixe o repositório pronto para a tarefa `T-02`.

## Contexto do projeto

O projeto é uma SPA de previsão meteorológica em TypeScript strict, React 19 e
Vite. O estilo usa Tailwind CSS; os testes usam Vitest, Testing Library e
Playwright; o lint e a formatação usam Biome; o gerenciador de pacotes é pnpm.
Os dados futuros serão obtidos da Open-Meteo, mas esta tarefa não implementa
integração de API, estado React ou componentes.

A arquitetura prevista separa:

- `src/types/` para contratos compartilhados;
- `src/lib/` para funções puras;
- `src/services/` para acesso à Open-Meteo;
- `src/hooks/` para orquestração;
- `src/components/` para apresentação;
- `tests/` para testes unitários e E2E.

## Tarefa do backlog

**T-01 — Confirmar a fundação de desenvolvimento**

### Critérios de aceite

1. `pnpm lint`, `pnpm build` e `pnpm test` terminam com código zero. Se algum
   comando não puder ser executado neste ambiente, registre o comando, a saída
   relevante, a causa e o impacto em um relatório de trabalho.
2. Os scripts de lint, build e teste no `package.json` referenciam as
   ferramentas previstas: Biome, TypeScript/Vite e Vitest.
3. Não é adicionada biblioteca de estado, cliente HTTP ou cache.
4. Não são criados arquivos de aplicação, tipos, services, hooks,
   componentes ou testes de feature nesta tarefa.

## Arquivos de entrada

- `package.json` — scripts, gerenciador e dependências.
- `pnpm-lock.yaml` — lockfile que deve permanecer consistente caso dependências
  sejam alteradas.
- `plans/weather-app-plan.md` — decisões de stack e gates de qualidade.
- `tasks/weather-app-tasks.md` — definição da `T-01` e dependência de `T-02`.
- `README.md` — comandos oficiais documentados para desenvolvimento e testes.

## Arquivos permitidos

- `package.json`, somente se um script ou dependência contradizer a stack
  definida.
- `pnpm-lock.yaml`, somente se uma alteração necessária em `package.json`
  exigir a atualização do lockfile.
- Um relatório temporário ou documentação existente, somente para registrar uma
  lacuna de execução; não crie documentação de produto nem código de feature.

Não altere `src/`, `tests/`, `specs/`, `plans/` ou o conteúdo funcional do
`README.md`.

## Procedimento

1. Leia os arquivos de entrada e confirme os scripts existentes antes de editar.
2. Verifique se `package.json` declara `packageManager: pnpm` e contém scripts
   equivalentes a `lint`, `build` e `test`.
3. Execute, nesta ordem, `pnpm lint`, `pnpm build` e `pnpm test`.
4. Se os três comandos passarem e os scripts estiverem alinhados, não faça
   edição de código ou dependências.
5. Se houver uma divergência diretamente relacionada à fundação, aplique a
   menor correção possível em `package.json` e atualize o lockfile somente se
   necessário. Não corrija falhas de funcionalidades futuras.
6. Se um comando falhar por causa do ambiente ou de uma lacuna existente,
   registre evidência suficiente para distinguir falha de configuração,
   dependência ausente e falha de código.
7. Ao finalizar, informe arquivos alterados, comandos executados, resultado de
   cada comando e quaisquer lacunas que bloqueiem `T-02`.

## Restrições

- Não adicione Redux, Zustand, TanStack Query, Axios, outro cliente HTTP ou
  qualquer cache.
- Não adicione tipos de domínio ou lógica meteorológica.
- Não altere versões sem necessidade comprovada.
- Não faça refatorações de formatação não relacionadas.
- Preserve pnpm como gerenciador de pacotes.
- Use narrativa do relatório em pt-BR e identificadores técnicos em en-US.

## Formato da resposta final

Use esta estrutura:

```text
Status T-01: concluída | concluída com lacunas | bloqueada

Arquivos alterados:
- <caminho ou “nenhum”>

Validações:
- pnpm lint: passou | falhou | não executado — <evidência>
- pnpm build: passou | falhou | não executado — <evidência>
- pnpm test: passou | falhou | não executado — <evidência>

Critérios de aceite:
- <critério 1>: atendido | não atendido — <evidência>
- <critério 2>: atendido | não atendido — <evidência>
- <critério 3>: atendido | não atendido — <evidência>
- <critério 4>: atendido | não atendido — <evidência>

Lacunas e impacto:
- <“nenhuma” ou descrição objetiva>
```