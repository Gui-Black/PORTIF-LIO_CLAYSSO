# Preview online — preparação autorizada

## Atualização de 11 de novembro de 2026

- Preview atualizado: https://clicks-do-morty-preview-ju197owf8.vercel.app, deployment `dpl_AB6Qz4Q4koUjVH3dYhKWHDZckVdk`, estado `READY`, ambiente `staging` (Preview).
- Origem: commit `66eb2a474750bce0ae41fefbd0e895d3bdfdb555`, enviado pelo usuário à `main`. Deploy manual como Preview, sem promoção a produção e sem atualizar `develop`.
- HTML e CSS hospedados responderam HTTP 200. O CSS entregue contém `height: auto` na foto 4:3 e a regra que preserva a centralização de `.contact-help`. Conferência visual no navegador e testes administrativos permanecem pendentes.
- Link de compartilhamento emitido em 11/11, válido por sete dias, entregue diretamente na conversa. Não versionar seu token. Ele permite visualizar o Preview sem conta Vercel; não concede acesso administrativo ao aplicativo.
- O build remoto acusou formatação de `vercel.json`, embora o arquivo do commit passasse localmente. Para este deployment, o Ignored Build Step manteve o bloqueio de produção e acrescentou somente `vercel.json` à exclusão remota do Prettier antes de liberar o build. Lint, demais verificações de formatação, testes e build continuam em `npm run check`. Essa adaptação é específica da publicação e requer revisão antes de automatizar novos deploys.

## Histórico da preparação

- Repositório privado: `Gui-Black/PORTIF-LIO_CLAYSSO`.
- Branch remota `develop` criada a partir de `3db88f2ec793534e9c091ab852f7e2e1e4099d06`; `main` preservada. Nenhum commit ou push foi feito pelo assistente.
- Projeto Vercel criado: `clicks-do-morty-preview`, ID `prj_h0AJwVBt7eWhrWsuq1Q6HoLO8yMw`, equipe `guilhermehenriqueblack-1426s-projects`.
- Vite, Node 24, instalação `npm ci`, build `npm run check`, saída `dist`.
- O acesso ao repositório pelo deploy via API funcionou em 10/11. O projeto ainda não aparece na listagem de projetos vinculados ao Git: a automação por push continua pendente de confirmação.
- Supabase criado na organização confirmada `Gui-Black's Org`: `clicks-do-morty-preview`, referência `uqsypmhgltfywnypuann`, região São Paulo (`sa-east-1`), estado `ACTIVE_HEALTHY`. Custo consultado antes da criação: US$ 0/mês. Banco local preservado.
- As cinco migrações existentes e o seed fictício foram aplicados. O histórico remoto foi alinhado aos nomes e versões dos arquivos locais, após a ferramenta atribuir timestamps próprios. A listagem final confirma correspondência com o repositório.
- `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` cadastradas na Vercel somente em Preview. Nenhuma chave privilegiada utilizada no frontend, nenhuma alteração no ambiente local.
- Verificação local concluída: `npm run check` aprovado, incluindo 62 testes, lint, formatação, TypeScript e build. Isso não substitui os testes do ambiente hospedado.
- Preview confirmado como `READY`: https://clicks-do-morty-preview-kenbkpkar.vercel.app, deployment `dpl_H2bRJtLqhSYJkfhKVpGzu7XYFySY`, origem `develop` no commit acima. Documento HTML retornou HTTP 200 pela ferramenta autenticada da Vercel. Isso não comprova login, upload ou renderização no navegador.
- A API exige `target: staging` para este Preview. A primeira tentativa sem target foi classificada como produção e cancelada pelo Ignored Build Step; não chegou a READY. Não omitir target em novos deployments.
- O primeiro build de Preview falhou porque Prettier analisou `.vercel/static-build/package-manifest.json`, gerado pela hospedagem. `.vercel/` foi adicionada localmente a `.prettierignore` e `.gitignore`. Neste deploy do commit anterior, o comando acrescentou essa exclusão antes de executar `npm run check`; após o commit da correção, usar novamente apenas `npm run check`.

## Separação de ambientes

`main` permanece a referência principal, mas não deve publicar uma versão oficial nesta fase. `develop` será a origem dos Previews. O projeto remoto recebeu um Ignored Build Step que ignora builds de produção. O `vercel.json` também desativa deployments Git de `main`; essa configuração só terá efeito quando estiver commitada e enviada. Não promover um Preview nem executar deploy de produção sem nova autorização.

As rotas atuais usam query strings (`/?acesso=painel` e `/?trabalho=...`), portanto não exigem rewrite de caminhos. `noindex, nofollow` permanece no HTML e foi preparado também no cabeçalho de resposta. Isso impede indexação solicitada, mas não é controle de acesso.

O Supabase local não será exposto à internet. O ambiente hospedado precisa de projeto separado, apenas migrações do aplicativo e seed fictício. Não transferir usuários, senhas ou arquivos locais automaticamente. Criar uma conta de teste pelo Auth e conceder acesso administrativo ao UUID correspondente por operação confiável; nunca habilitar autoinscrição administrativa.

## Configuração pendente do Supabase hospedado

1. Projeto criado sem custo mensal informado; acompanhar limites de uso e não contratar serviços pagos automaticamente.
2. Migrações e verificações iniciais concluídas. Não executar o wrapper `supabase-local.mjs` contra a nuvem: ele é intencionalmente local.
3. Variáveis de **Preview** cadastradas. Nunca usar a URL localhost, chave secreta, senha de banco ou `service_role` em variáveis `VITE_*`.
4. Usar a URL estável da branch como Site URL e permitir o retorno exato `/?acesso=nova-senha`. Evitar um wildcard amplo cobrindo outros projetos Vercel. Para testar recuperação, validar as restrições do envio de e-mail hospedado; o Mailpit local não atende a nuvem.
5. Criar a conta administrativa de teste e cadastrar imagens autorizadas. Credenciais não devem ser versionadas nem incluídas nesta documentação.

Os itens 4 e 5 ainda dependem da URL do Preview e da configuração de Auth no painel Supabase. As ferramentas disponíveis não oferecem edição de configuração de Auth nem criação de usuário administrativo. Desativar cadastros públicos em Authentication antes de compartilhar o painel; criar a conta de teste pelo painel e provisionar somente seu UUID como administrador. Não inserir senhas diretamente nas tabelas Auth.

### Verificações do banco hospedado

- As seis tabelas da aplicação estão com RLS habilitado.
- Consulta no papel `anon`: cinco categorias, zero trabalhos e zero versões visíveis. O rascunho demonstrativo permanece oculto.
- Bucket `portfolio` privado, limite de 10 MiB. Nenhuma fotografia foi transferida.
- Visitante não tem permissão de executar a função de publicação; conta autenticada não tem leitura direta da tabela de administradores. Nenhum administrador foi provisionado.
- O advisor informou oito avisos de funções `SECURITY DEFINER` acessíveis a usuários autenticados. São as operações administrativas existentes, com verificação explícita de `private.is_administrator()` antes das alterações, privilégios revogados para visitantes e `search_path` fixo. Preservadas após revisão; não tratar os avisos como ausência de autorização. [Explicação do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- O aviso informativo de RLS sem políticas em `private.administrators` é intencional: não há acesso direto pelo cliente. [Explicação do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Login, upload, URLs assinadas e fluxo completo via navegador hospedado continuam pendentes.

## Conexão Git e compartilhamento

Após liberar o repositório para o aplicativo Vercel, conectar o projeto existente em Settings → Git. Manter `main` como Production Branch e `develop` como branch de Preview. A proteção Vercel está habilitada; antes de enviar um link ao Claysso, validar o mecanismo de compartilhamento para convidados ou seu acesso autorizado. Não remover a proteção de toda a conta para resolver um único Preview.

O usuário continua responsável pelos commits e pushes. Para começar a trabalhar na branch já criada no GitHub, depois de preservar as alterações locais:

```powershell
git fetch origin
git switch --track origin/develop
```

Se `develop` já existir localmente, usar `git switch develop`. Revisar `git status` antes de adicionar arquivos. Enviar os arquivos de configuração e documentação com uma mensagem como `Prepara publicação do protótipo na Vercel`. Após conectar o Git, cada push para `develop` deve gerar um Preview; acompanhar o estado do build e compartilhar somente uma URL com estado READY.

## Verificação e recuperação

Validar o login de teste, criar uma seleção fictícia, enviar uma foto, escolher capa e publicar apenas no catálogo de testes. Abrir a galeria sem sessão administrativa e conferir que rascunhos continuam privados. Verificar também edição de cópia e retirada. Um Preview disponível não equivale a homologação aprovada.

Cada deployment mantém uma URL própria. Para comparar ou voltar a uma versão anterior do frontend, abrir o Preview correspondente ou fazer novo Preview de um commit revisado. Isso não reverte migrações, contas ou fotografias; confirmar compatibilidade com o banco. Backups do banco e do Storage continuam necessários antes do uso definitivo.

## Custos

Não houve contratação de plano pago. A Vercel restringe Hobby a uso pessoal e não comercial; não presumir que um portfólio destinado à divulgação de serviços pode operar comercialmente nesse plano só porque foi chamado de protótipo. Conferir enquadramento/plano antes de uso comercial. Os limites do Supabase deverão ser conferidos na organização conectada antes do provisionamento.

Referências: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [GitHub e permissões](https://vercel.com/kb/guide/unable-to-find-github-repository), [uso permitido nos planos](https://vercel.com/docs/limits/fair-use-guidelines).
