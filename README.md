# Click’s do Morty

Portfólio de fotografia para Guarulhos e São Paulo, com contato pelo WhatsApp e Instagram e administração pelo próprio fotógrafo.

O projeto também serve como percurso de aprendizado em React, TypeScript e Supabase. O desenvolvimento será feito em entregas pequenas, com explicação dos conceitos e validação de cada etapa.

## Estado atual

Base técnica da etapa 1 preparada e verificada. A aplicação contém uma página provisória para conferir React e Vite. O layout final, as galerias, as animações e o painel pertencem às próximas etapas. O primeiro commit depende da definição de autoria Git.

- [Planejamento aprovado](docs/planejamento.md)
- [Andamento e verificações](docs/andamento.md)
- [Guia da primeira etapa](docs/aprendizado.md)

## Requisitos

- Node.js 22.13 ou superior na linha 22, ou Node.js 24 ou superior.
- npm.
- Git para acompanhar as alterações.

As versões exatas das dependências ficam em `package.json` e `package-lock.json`. O ambiente usado na preparação possui Node.js 24.22.2 e npm 11.19.1.

Uma substituição transitiva em `overrides` fixa `minimatch` em 11.0.1 para corrigir o alerta GHSA-g3hv-75wg-m249 presente nas dependências das ferramentas de lint. Lint e build passaram com essa configuração. Reavaliar a substituição quando ESLint e typescript-eslint atualizarem suas dependências. [Aviso do mantenedor](https://github.com/advisories/GHSA-g3hv-75wg-m249)

## Executar localmente

Na pasta do projeto, instale as dependências a partir do arquivo de versões.

```sh
npm ci
npm run dev
```

Abra o endereço local informado pelo Vite. Nesta etapa, a aplicação funciona sem variáveis de ambiente ou contas externas.

## Verificações

```sh
npm run check
```

Esse comando verifica lint, formatação, tipos e a geração da versão de produção. Os comandos também podem ser executados separadamente.

| Comando                | Finalidade                                   |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Iniciar o ambiente local de desenvolvimento  |
| `npm run typecheck`    | Verificar os tipos TypeScript                |
| `npm run lint`         | Verificar regras de qualidade e uso de React |
| `npm run format:check` | Conferir a formatação                        |
| `npm run format`       | Aplicar a formatação padronizada             |
| `npm run build`        | Verificar os tipos e gerar a pasta `dist`    |
| `npm run preview`      | Servir localmente a versão gerada em `dist`  |

`preview` pressupõe uma execução bem-sucedida de `build` e serve para conferência local.

## Estrutura atual

| Arquivo              | Responsabilidade                               |
| -------------------- | ---------------------------------------------- |
| `index.html`         | Documento HTML e elemento de montagem do React |
| `src/main.tsx`       | Inicialização da aplicação                     |
| `src/app/App.tsx`    | Componente inicial provisório                  |
| `src/app/styles.css` | Estilos básicos da página provisória           |
| `vite.config.ts`     | Configuração do Vite e integração com React    |
| `tsconfig.*.json`    | Regras de verificação de tipos                 |
| `eslint.config.js`   | Regras de análise do código                    |
| `.prettierrc.json`   | Padrão de formatação                           |
| `docs`               | Planejamento, andamento e aprendizado          |

As pastas de funcionalidades serão criadas junto de suas primeiras implementações. As dependências do Supabase e de animação serão avaliadas nas etapas em que forem utilizadas.

## Padrões de desenvolvimento

- Usar nomes que expressem a intenção e funções com responsabilidade clara.
- Manter componentes, acesso aos dados e regras de negócio compreensíveis.
- Extrair funções e hooks quando houver uma responsabilidade concreta ou reutilização real.
- Preferir tipos explícitos nas fronteiras e inferência nas operações locais.
- Tratar erros, carregamento, operações em andamento e tentativas repetidas.
- Validar permissões no backend e no armazenamento.
- Revisar mudanças, executar verificações e produzir commits pequenos por entrega.
- Criar testes para riscos concretos, sobretudo permissões, publicação e uploads.
- Guardar segredos fora do repositório. `.gitignore` protege arquivos de ambiente locais.

## Versionamento e publicação

A proposta usa `main` como referência estável e branches curtas por funcionalidade. Antes de cada commit, revise `git diff` e execute as verificações correspondentes. Após revisar arquivos novos, adicione somente os arquivos da entrega.

O repositório inicial ainda precisa de identidade de autoria e de um endereço remoto. A configuração será feita com os dados informados pelo responsável.

A publicação será tratada na etapa de homologação. O HTML provisório inclui `noindex, nofollow`, que deverá ser revisado antes da publicação oficial.
