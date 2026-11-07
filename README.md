# Click’s do Morty

Portfólio de fotografia para Guarulhos e São Paulo, com contato pelo WhatsApp e Instagram e administração pelo próprio fotógrafo.

O projeto também serve como percurso de aprendizado em React, TypeScript e Supabase. O desenvolvimento será feito em entregas pequenas, com explicação dos conceitos e validação de cada etapa.

## Estado atual

Fundação da etapa 4 implementada e validada em memória: migrações PostgreSQL para Supabase, permissões e publicação transacional. A interface mantém a galeria da etapa 3 com dados locais. A conexão ao Supabase, o login e o painel serão integrados nas próximas entregas. A execução com os serviços Supabase completos ainda está pendente.

A validação separa testes da aplicação, testes SQL/RLS e integração com serviços reais. Os resultados e limites ficam em `docs/andamento.md`. A publicação na Vercel foi adiada por decisão do usuário; o desenvolvimento continua localmente.

- [Planejamento aprovado](docs/planejamento.md)
- [Andamento e verificações](docs/andamento.md)
- [Guia de aprendizado](docs/aprendizado.md)
- [Direção visual e fotografias](docs/visual.md)
- [Galeria, navegação e roteiro de validação](docs/galeria.md)
- [Banco, permissões e execução local](docs/banco.md)

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

Esse comando verifica lint, formatação, testes, tipos e a geração da versão de produção. `npm run test` usa o executor nativo do Node. Os testes de banco usam PGlite como dependência de desenvolvimento e não exigem Docker, credenciais ou conta Supabase. Essa dependência não é importada pela aplicação React.

| Comando                | Finalidade                                    |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Iniciar o ambiente local de desenvolvimento   |
| `npm run test`         | Executar os testes de aplicação e banco       |
| `npm run test:db`      | Executar somente os testes SQL/RLS em memória |
| `npm run typecheck`    | Verificar os tipos TypeScript                 |
| `npm run lint`         | Verificar regras de qualidade e uso de React  |
| `npm run format:check` | Conferir a formatação                         |
| `npm run format`       | Aplicar a formatação padronizada              |
| `npm run build`        | Verificar os tipos e gerar a pasta `dist`     |
| `npm run preview`      | Servir localmente a versão gerada em `dist`   |

`preview` pressupõe uma execução bem-sucedida de `build` e serve para conferência local.

## Estrutura atual

| Arquivo                  | Responsabilidade                                |
| ------------------------ | ----------------------------------------------- |
| `index.html`             | Documento HTML e elemento de montagem do React  |
| `src/main.tsx`           | Inicialização da aplicação                      |
| `src/app/App.tsx`        | Navegação entre início e detalhe do trabalho    |
| `src/app/styles.css`     | Estilos globais e acessibilidade                |
| `src/app/tokens.css`     | Cores, fontes e espaçamento lateral             |
| `src/components`         | Cabeçalho responsivo e ícone compartilhado      |
| `src/features/home`      | Narrativa visual e comportamento de rolagem     |
| `src/features/portfolio` | Dados locais, galeria, detalhe e visualizador   |
| `public/images`          | Seis fotografias utilizadas no portfólio        |
| `tests`                  | Integridade dos dados e lógica de navegação     |
| `supabase/migrations`    | Tabelas, restrições, RLS, publicação e Storage  |
| `supabase/seed.sql`      | Dados fictícios para ambiente local             |
| `supabase/config.toml`   | Configuração proposta para o Supabase local     |
| `assets/fotografias`     | Sete arquivos recebidos, preservados sem edição |
| `vite.config.ts`         | Configuração do Vite e integração com React     |
| `tsconfig.*.json`        | Regras de verificação de tipos                  |
| `eslint.config.js`       | Regras de análise do código                     |
| `.prettierrc.json`       | Padrão de formatação                            |
| `docs`                   | Planejamento, andamento e aprendizado           |

A animação desta demonstração usa recursos nativos do navegador, sem dependência adicional. O Supabase será integrado na etapa correspondente.

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

O primeiro commit foi registrado pelo usuário e o repositório está conectado ao GitHub. Os próximos commits continuam sob responsabilidade do usuário.

A publicação será tratada na etapa de homologação. O HTML provisório inclui `noindex, nofollow`, que deverá ser revisado antes da publicação oficial.
