# Aprendizado do projeto

## Como a aplicação começa

O navegador recebe `index.html`, que contém um elemento com identificador `root`. O arquivo `src/main.tsx` encontra esse elemento e pede ao React para renderizar `App` dentro dele.

`App` é um componente, uma função que descreve parte da interface usando JSX. Na etapa 1 ele apresentava uma mensagem provisória. Na etapa 2 compõe `SiteHeader` e `HomePage`.

## React, TypeScript e Vite

React organiza a interface em componentes. Conforme implementarmos a galeria, os componentes receberão informações por propriedades e responderão às ações do visitante.

TypeScript adiciona verificação de tipos ao JavaScript. O projeto usa o modo estrito. Em `main.tsx`, por exemplo, a busca pelo elemento raiz pode retornar um elemento ou `null`. A verificação explícita trata essa possibilidade antes de inicializar a aplicação.

Vite executa o ambiente local e gera os arquivos para produção. O comando de build também verifica os tipos para impedir uma entrega com erros detectáveis nessa etapa.

## Por que há ferramentas diferentes

| Ferramenta    | O que verifica                                     |
| ------------- | -------------------------------------------------- |
| TypeScript    | Compatibilidade dos tipos e uso de valores         |
| ESLint        | Padrões de código e uso correto dos hooks de React |
| Prettier      | Formatação consistente                             |
| Build do Vite | Geração dos arquivos distribuíveis                 |

Essas verificações complementam os testes de comportamento e a conferência visual que serão introduzidos conforme as funcionalidades existirem.

## Dependências e versões

`package.json` descreve scripts e dependências diretas. `package-lock.json` registra a árvore concreta instalada. Em uma cópia do projeto, `npm ci` usa essa árvore para reproduzir a instalação.

React e React DOM são dependências da aplicação. As ferramentas de desenvolvimento ficam em `devDependencies`. O cliente do Supabase será instalado quando começarmos a integração.

## Um exercício curto

Depois de iniciar `npm run dev`, localize o título em `src/features/home/HomePage.tsx` e altere o texto. Observe a atualização no navegador e consulte `git diff` para ver exatamente o que mudou. Em seguida, execute `npm run check`.

Esse exercício conecta componente, ambiente local, validação e versionamento. O commit deve ser feito depois de revisar a alteração.

## Etapa 2 — componentes, estado e efeitos

`SiteHeader` cuida da navegação e usa `useState` para guardar se o menu está aberto. Quando esse valor muda, React atualiza o botão e a navegação. `HomePage` descreve as seções e `ArrowIcon` evita repetir o mesmo SVG.

`useScrollExperience` concentra o comportamento de rolagem. `useRef` permite acessar o elemento da página. `useEffect` conecta os observadores e eventos depois da montagem, devolvendo uma função de limpeza para removê-los quando o componente sair da tela. Isso também permite o ciclo extra de montagem e limpeza do StrictMode durante o desenvolvimento.

`IntersectionObserver` avisa quando um elemento entra na área visível. A revelação acontece uma vez. Para a mudança de atmosfera, `requestAnimationFrame` agrupa eventos de rolagem e atualiza uma variável CSS, sem renderizar toda a árvore React a cada movimento.

As cores e fontes ficam em `tokens.css`. Os estilos do cabeçalho ficam junto dele, e os da página ficam em `features/home`. Essa separação acompanha responsabilidades concretas.

## Arquivos de entrada e saída

`src` contém código que o Vite processa. `public` contém arquivos copiados para a versão final. `dist` é gerada pelo build e não deve receber arquivos que precisam ser preservados. As fotos fornecidas ficam guardadas em `assets/fotografias`, e três cópias usadas na página ficam em `public/images`.

Como exercício, altere `--accent` em `tokens.css`, veja quais elementos compartilham essa cor e restaure o valor antes de avaliar o conjunto. Depois, navegue pelo site usando somente Tab e Enter.

## Etapa 3 — dados, estado e navegação

Os tipos `Photo` e `Work` descrevem o formato dos dados. A página recebe um trabalho por propriedades, sem precisar saber se ele veio de um arquivo ou de um banco. Na integração futura, essa separação permitirá trocar a origem dos dados com menos mudanças na interface.

A lista filtrada é calculada a partir da categoria atual. Não precisamos guardar duas listas em estado e mantê-las sincronizadas. Já a foto selecionada no visualizador usa `useState`, porque muda por uma ação do visitante.

O filtro e o trabalho aparecem na URL. Assim, recarregar ou copiar o endereço mantém o destino. `useSyncExternalStore` conecta React a essa informação externa; `pushState`, `replaceState` e `popstate` controlam a navegação. O estado do histórico guarda a posição e o cartão para o retorno.

O elemento nativo `dialog`, aberto por `showModal`, coloca o visualizador em uma camada modal e torna o restante da página inativo. O efeito guarda o foco anterior e a rolagem do corpo e restaura ambos na limpeza. Os testes de lógica não substituem a conferência desse comportamento no navegador.

Como exercício, filtre Casamentos, abra uma seleção e observe a URL. Volte e confira o filtro. Depois veja `portfolioUrl` e acompanhe de onde vêm seus argumentos. Execute `npm run test` para conhecer os casos que protegem a navegação e os dados.

## Etapa 4 — banco, integridade e permissões

Uma migração é um arquivo SQL que descreve uma mudança reproduzível no banco. O seed cria dados de exemplo. Nesta etapa, os testes aplicam os dois em PostgreSQL em memória, sem modificar uma conta Supabase.

Uma chave primária identifica uma linha. Uma chave estrangeira garante que uma referência exista. Usamos também chaves compostas: não basta a capa ser uma foto existente, ela precisa pertencer à mesma versão. O banco rejeita a associação errada mesmo que a interface contenha um bug.

`GRANT` define quais operações e colunas uma conta pode acessar. RLS decide quais linhas ela pode enxergar ou modificar. Estar autenticado não significa ser administrador; essa autorização vem de uma tabela privada, gerenciada por um operador confiável.

O trabalho é uma identidade estável. O rascunho é seu conteúdo em edição. Publicar valida e sela uma versão, depois faz o trabalho apontar para ela. As duas alterações acontecem na mesma transação: ou ambas são concluídas, ou nenhuma é aplicada.

A revisão funciona como um número de edição. Se uma foto muda depois que a tela foi carregada, publicar com o número antigo falha e pede uma atualização. Os bloqueios de linha mantêm a publicação e alterações de fotos coordenadas; o teste com múltiplas conexões ainda será feito no Supabase local completo.

Como exercício, rode `npm run test:db` e encontre o teste de uma capa pertencente a outro trabalho. A seguir, veja a chave `version_cover_fk` na primeira migração. Depois acompanhe o teste em que uma publicação falha e a versão anterior continua visível. Esses casos mostram por que as regras também pertencem ao banco.
