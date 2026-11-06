# Aprendizado da etapa 1

## Como a aplicação começa

O navegador recebe `index.html`, que contém um elemento com identificador `root`. O arquivo `src/main.tsx` encontra esse elemento e pede ao React para renderizar `App` dentro dele.

`App` é um componente, uma função que descreve parte da interface usando JSX. Nesta etapa, ele apresenta somente a marca e uma mensagem provisória.

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

Depois de iniciar `npm run dev`, localize a mensagem em `src/app/App.tsx` e altere o texto. Observe a atualização no navegador e consulte `git diff` para ver exatamente o que mudou. Em seguida, execute `npm run check`.

Esse exercício conecta componente, ambiente local, validação e versionamento. O commit deve ser feito depois de revisar a alteração e configurar sua identidade de autoria.
