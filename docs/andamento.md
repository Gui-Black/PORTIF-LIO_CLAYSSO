# Andamento do projeto

## Estado atual

Etapa 8 visual implementada no código em 8 de novembro de 2026, com aprovação visual e editorial pendente. A validação real das revisões da etapa 7 ainda precisa ser confirmada pelo usuário.

A publicação contínua na Vercel foi adiada pelo usuário. O desenvolvimento segue local, sem provisionamento remoto ou deploy.

## Etapa 8 — apresentação visual

- [x] Completar seis cenas com a seção “Antes do primeiro clique”.
- [x] Adicionar navegação para a experiência e orientar o primeiro contato.
- [x] Estender a transição por rolagem a múltiplas cenas, preservando movimento reduzido.
- [x] Ampliar legendas e adaptar a nova seção para celular e tablet.
- [x] Executar lint, formatação, 59 testes, TypeScript e build.
- [ ] Aprovar aparência, textos e recortes com Claysso.
- [ ] Conferir navegador, teclado, movimento reduzido e larguras de 320 a 1440 px.
- [ ] Confirmar conteúdo definitivo e preparar imagens para lançamento.

A captura automatizada no navegador não produziu imagem; não há aprovação visual nesta sessão. Consulte [Direção visual](visual.md). Nenhuma migração, commit, push ou publicação remota foi realizada nesta etapa.

## Etapa 7

- [x] Criar cópia de trabalho publicado preservando a versão pública e reutilizando arquivos.
- [x] Reordenar fotos com validação de pertencimento e revisão.
- [x] Retirar e restaurar fotos dentro do rascunho, limpando a capa quando necessário.
- [x] Retirar trabalhos da galeria e preparar uma nova publicação.
- [x] Proteger leitura pública contra fotos retiradas e alterações em versões seladas.
- [x] Executar 59 testes, lint, formatação, TypeScript e build.
- [ ] Aplicar a nova migração no Supabase real local.
- [ ] Testar revisão, ordenação, retirada, restauração e republicação em navegador.
- [ ] Testar concorrência em duas abas e layout/teclado no celular e desktop.

Consultar [Revisões](revisoes.md). A exclusão desta entrega é lógica e reversível no rascunho. Limpeza de arquivos órfãos, exclusão definitiva, backups e recuperação de histórico arbitrário permanecem pendentes. Testes SQL usam PGlite, sem acesso ao Docker real pela sessão automatizada. Nenhum commit, push ou deploy foi executado pelo assistente.

## Etapa 6

- [x] Criar trabalhos e rascunhos por operação atômica, com retomada sem duplicação.
- [x] Salvar título, descrição, categoria e capa com controle de revisão.
- [x] Enviar JPEG, PNG e WebP ao bucket privado e retomar falhas de associação.
- [x] Publicar seleções completas por transação, mantendo versões publicadas imutáveis.
- [x] Integrar a galeria pública com cliente anônimo separado da sessão administrativa.
- [x] Paginar consultas para não truncar catálogos no limite de registros da API.
- [x] Preservar o editor durante revalidação de sessão, bloqueando operações enquanto verifica acesso.
- [x] Executar lint, formatação, 50 testes, TypeScript e build com sucesso.
- [x] Usuário confirmou o envio funcionando após a orientação para aplicar a migração local.
- [ ] Testar upload HTTP, retomada, publicação, acesso anônimo e concorrência em duas abas.
- [ ] Conferir interação, acessibilidade e layout no navegador.

O acesso ao Docker permanece negado para a sessão automatizada. Os testes usam PGlite e respostas simuladas; nenhuma validação visual ou ponta a ponta foi concluída pelo assistente. Seguir o [roteiro de gerenciamento](gerenciamento.md). Nenhum commit, push ou deploy foi executado. Reordenação, retirada reversível e revisão de trabalhos foram implementadas na etapa 7.

## Etapa 5

- [x] Adicionar SDK Supabase 2.119.0 com versão fixa e zero vulnerabilidades reportadas na instalação.
- [x] Implementar telas de login, solicitação de recuperação e nova senha.
- [x] Restaurar sessão, oferecer saída e verificar identidade/autorização no servidor.
- [x] Bloquear a área administrativa para conta comum e falhas de verificação.
- [x] Criar migração de consulta da permissão da própria sessão, sem expor administradores.
- [x] Preparar geração de `.env.local` apenas com URL e chave publicável, preservando arquivo existente.
- [x] Preparar atalho para migrações locais sem reset ou destino remoto.
- [x] Executar lint, formatação, 43 testes, TypeScript e build.
- [ ] Aplicar a nova migração no Supabase real e reiniciar serviços com os redirects atualizados.
- [ ] Completar configuração das contas fictícias de administrador e visitante (usuário informou criação de conta).
- [ ] Validar login, sessão, saída, recuperação, revogação e acesso negado em navegador.
- [ ] Conferir layout, teclado e mensagens em telas pequenas e grandes.

O Docker continua negando acesso à sessão automatizada. Nenhuma conta foi criada e a nova migração não foi aplicada ao banco real pelo assistente. Testes de autorização no banco usam PGlite; testes de serviço usam respostas simuladas. O SDK é carregado em um chunk separado da página pública. Na entrega original desta etapa, a tela administrativa apenas confirmava o acesso; edição e upload foram adicionados na etapa 6. Seguir [Autenticação](autenticacao.md) para ativação e teste local. Nenhum commit, push ou deploy foi executado.

## Etapa 4

### Preparação do ambiente completo

- [x] Fixar Supabase CLI 3.0.0 como dependência de desenvolvimento.
- [x] Conferir versão e ajuda da CLI com estado local em diretório ignorado pelo Git.
- [x] Criar atalhos de verificação, inicialização, consulta e parada.
- [x] Preparar verificação de Docker local/Linux e rede com portas em localhost.
- [x] Documentar instalação, credenciais, dados e próximos testes em [Ambiente local](ambiente-local.md).
- [x] Instalar Docker Desktop (usuário); localizar cliente 29.9.2 e contexto Linux local.
- [x] Confirmar `supabase:check` no terminal do usuário (saída compartilhada).
- [x] Confirmar serviços e leitura real pelo `supabase:verify` (saída compartilhada pelo usuário em 7 de novembro de 2026).
- [ ] Iniciar os serviços e validar migrações, Auth, Storage e concorrência reais.

Após a instalação pelo usuário, o Docker foi encontrado em seu diretório de programas, embora o PATH desta sessão ainda não o reconhecesse. O cliente informou versão 29.9.2 e contexto `dockerDesktopLinuxEngine`; a consulta à API retornou acesso negado. Não foi possível confirmar o funcionamento do motor. Os atalhos agora reconhecem os caminhos usuais de instalação no Windows e diferenciam esse erro de executável ausente. A próxima verificação precisa ser executada no terminal do usuário, conforme [Ambiente local](ambiente-local.md).

A CLI funciona usando `SUPABASE_HOME` dentro do projeto. Os testes do script simulam respostas do Docker e não comprovam a inicialização real nem a exposição das portas. O frontend continua independente desses serviços. Login, Auth/Storage reais e concorrência continuam pendentes até essa validação.

O usuário iniciou os serviços e compartilhou a saída bem-sucedida de `npm run supabase:verify` em 7 de novembro de 2026. A execução real confirmou Auth respondendo, as cinco categorias públicas, existência e ocultação do trabalho/versão demonstrativos ao visitante e bucket `portfolio` privado. A evidência veio do PowerShell do usuário; a sessão automatizada anteriormente recebeu acesso negado ao Docker e conexão recusada nas portas locais. Os testes unitários do verificador usam HTTP simulado e são uma evidência separada.

Essa verificação é somente de leitura. Ainda faltam login e recuperação de senha, permissões de contas autenticadas, uploads, URLs assinadas, concorrência, histórico integral de migrações e versão efetiva do PostgreSQL. Nenhuma conta administrativa foi criada nesta confirmação.

Última validação automatizada do código: `npm run check` aprovado com 38 testes, lint, formatação, TypeScript e build, incluindo os cinco testes do verificador. A instalação anterior das dependências informou zero vulnerabilidades; não foram adicionadas dependências nesta confirmação. Nenhum commit, push ou deploy foi executado pelo assistente.

### Fundação do banco

- [x] Criar as seis tabelas, com administradores em schema privado.
- [x] Definir relações, capa por versão, ordem das fotos e um rascunho por trabalho.
- [x] Aplicar RLS e permissões de tabela, coluna e função.
- [x] Implementar publicação/retirada transacionais com controle de revisão.
- [x] Proteger versões seladas contra alterações.
- [x] Preparar bucket privado e políticas de Storage, bloqueando sobrescrita e exclusão pela aplicação.
- [x] Preparar seed fictício sem contas, credenciais ou fotos reais.
- [x] Executar 16 testes de banco e os oito testes anteriores.
- [x] Validar lint, formatação, tipos e build.
- [ ] Validar config, migrações, Auth e Storage no Supabase local completo.
- [ ] Testar concorrência em conexões independentes e URLs assinadas reais.
- [x] Revisar e commitar a fundação da etapa 4 pelo usuário.

`npm run check` passou com 24 testes. O PGlite 0.5.15 executou PostgreSQL 18.6 em memória; o contrato mínimo de Auth/Storage simula somente identidade e metadados. Isso valida as regras SQL e RLS, mas não substitui os serviços completos. O ambiente Supabase proposto usa PostgreSQL 17 e também precisará dessa conferência. Não foram encontrados Docker, CLI Supabase ou `psql` no terminal.

A dependência adicionada é exclusiva dos testes. O frontend não foi conectado ao banco e o build da aplicação mantém os mesmos arquivos JS/CSS da etapa anterior. Ver [Banco e permissões](banco.md) para o modelo, a matriz de acesso, a execução e as limitações.

## Etapa 3

- [x] Criar dados tipados para duas seleções e seis fotografias.
- [x] Implementar filtros das cinco categorias planejadas e estado vazio.
- [x] Implementar detalhe com endereço próprio e trabalho não encontrado.
- [x] Implementar fotos ampliadas, controles, atalhos e gesto lateral.
- [x] Preservar filtro, rolagem e alvo de foco no retorno à galeria.
- [x] Tratar falha de imagem e manter navegação nativa para cliques modificados.
- [x] Acrescentar oito testes automatizados sem dependências novas.
- [x] Validar lint, formatação, testes, tipos e build.
- [x] Conferir resposta HTTP da página, endereços de detalhe e seis imagens.
- [ ] Conferir navegação, foco, gesto e layout em navegador real.
- [ ] Validar nomes e agrupamentos provisórios com Claysso.
- [x] Revisar e commitar a entrega pelo usuário.

## Verificações da etapa 3

| Verificação              | Resultado                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| `npm run check`          | ESLint, Prettier, oito testes, TypeScript e build aprovados                     |
| HTTP local               | Página, entradas por consulta e seis imagens retornaram 200                     |
| Dados e navegação        | Testes de filtros, fotos, links, índices, gestos e histórico simulado aprovados |
| Conferência em navegador | Pendente; prévia integrada retornou erro e navegador integrado indisponível     |

O HTTP 200 de um endereço inválido é a resposta do servidor estático ao documento da aplicação. A tela de trabalho não encontrado é decidida pelo cliente. Não há status HTTP 404 específico nesta etapa.

Os testes de histórico simulam a API e não comprovam layout, foco, gesto físico ou acessibilidade em um navegador real. O roteiro completo está em [Galeria e validação](galeria.md). Para conferir, executar `npm run dev` e abrir o endereço indicado no terminal.

O aviso de `http-proxy` continua vindo do ambiente hospedeiro, sem impedir as verificações. Não foram adicionadas dependências.

## Versionamento

Os commits continuam sob responsabilidade do usuário. Sugestão para esta preparação: `Prepara ambiente local do Supabase`.

## Próxima entrega

Concluir a validação real da etapa 5 pelo roteiro de autenticação e depois iniciar cadastro, upload e publicação da etapa 6. Antes da integração definitiva das páginas públicas, resolver renderização, metadados sociais e acesso às imagens. A conferência visual da galeria continua pendente.
