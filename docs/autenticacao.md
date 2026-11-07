# Acesso administrativo — etapa 5

## Implementado e pendente

Login com e-mail/senha, sessão persistente, saída local, solicitação de recuperação e formulário de nova senha foram implementados com `@supabase/supabase-js` 2.119.0. O pacote e a tela de acesso são carregados apenas quando uma rota administrativa é aberta. Na etapa 6, a galeria passou a consultar trabalhos publicados no Supabase quando configurado; sem configuração, usa dados demonstrativos.

O código passou por lint, formatação, 43 testes, TypeScript e build. A consulta de autorização foi testada no PostgreSQL em memória. Os testes de serviço usam respostas simuladas. A sessão automatizada continua sem acesso ao Docker: a nova migração, as contas e os fluxos reais de login/recuperação ainda precisam da validação abaixo. Não foram criadas contas nem aplicadas migrações no banco real nesta entrega. A conferência visual em navegador também está pendente.

## Preparar no PowerShell do usuário

Na raiz do projeto, executar cada comando e continuar apenas se terminar sem erro:

```powershell
npm run supabase:stop
npm run supabase:start
npm run supabase:migrate
npm run supabase:env
npm run dev -- --port 5173 --strictPort
```

A parada/inicialização preserva dados e carrega as novas URLs de retorno e o mínimo de 12 caracteres para novas senhas. Não usar reset. O atalho `supabase:migrate` executa `migration up`, que na CLI 3 usa o banco local por padrão. O atalho não aceita argumentos extras ou destinos remotos.

`supabase:env` cria `.env.local` somente se ele não existir. Exporta apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, a partir do status local, sem imprimir valores. Se já existir, o arquivo é preservado; revisar as duas variáveis usando `.env.example` como referência. Reiniciar o Vite após alterar variáveis. Não compartilhar a saída de `supabase:status`, pois contém chaves privilegiadas.

Nunca colocar chaves `secret`/`service_role`, senha de banco ou tokens em variáveis `VITE_*`: seus valores entram no bundle público. A validação do cliente rejeita chaves não publicáveis, mas isso não remove do bundle um segredo colocado indevidamente em uma variável de build. O gerador exporta somente a chave publicável. `.env.local` é ignorado pelo Git.

Usar sempre o mesmo endereço (`localhost` ou `127.0.0.1`) no navegador durante o teste. Os redirects cadastrados correspondem à porta 5173; `--strictPort` evita iniciar silenciosamente em outra porta.

## Endereços

| Tela                                   | Endereço                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| Login / confirmação de acesso          | `http://localhost:5173/?acesso=entrar`                   |
| Área administrativa inicial            | `http://localhost:5173/?acesso=painel`                   |
| Solicitar recuperação                  | `http://localhost:5173/?acesso=recuperar`                |
| Nova senha                             | Aberta pelo link de recuperação em `/?acesso=nova-senha` |
| Studio local                           | `http://127.0.0.1:54323`                                 |
| E-mails locais (Mailpit, porta padrão) | `http://127.0.0.1:54324`                                 |

O painel foi ampliado na etapa 6 com cadastro, upload e publicação. Consulte o [roteiro de gerenciamento](gerenciamento.md).

## Criar contas de teste

No Studio local, abrir a área de usuários de Authentication e criar duas contas por meio do gerenciamento de usuários do Auth: `fotografo@example.test` e `visitante@example.test`. Definir senhas de teste exclusivas com pelo menos 12 caracteres e confirmar os e-mails pelo recurso administrativo disponível. Não inserir registros diretamente em `auth.users` nem versionar senhas. O cadastro público continua desativado.

Copiar o UUID da conta do fotógrafo. No SQL Editor do Studio **local**, um operador confiável deve executar, substituindo o texto pelo UUID dessa conta:

```sql
insert into private.administrators (user_id)
values ('UUID-DA-CONTA-DO-FOTOGRAFO'::uuid)
on conflict (user_id) do nothing;
```

Não adicionar a conta visitante. Essa concessão é feita fora do navegador da aplicação; o frontend não pode conceder privilégios ou listar administradores. As contas fictícias ficam somente no ambiente local.

## Autenticação e autorização

Autenticação confirma quem entrou; autorização decide o que essa conta pode fazer. Uma conta Auth comum não é automaticamente administradora.

A migração `20261107000100_admin_access.sql` adiciona `public.current_user_is_administrator()`. A função não recebe UUID externo e retorna somente um booleano sobre `auth.uid()` da própria sessão. Visitantes não podem executá-la. O acesso à tabela privada continua bloqueado. RLS e permissões do banco continuam sendo a barreira de segurança, mesmo se alguém modificar o JavaScript do navegador.

O cliente valida a identidade com `getUser`, consulta a função e só exibe a confirmação administrativa quando o retorno é exatamente `true`. Falha de rede ou migração ausente resulta em erro com tentativa novamente, nunca em acesso concedido. Uma conta comum recebe uma mensagem de acesso não autorizado e pode sair. Ao recuperar o foco da janela, a permissão é consultada novamente. Respostas de verificações antigas são descartadas após mudança de sessão ou desmontagem.

## Sessão e recuperação

O SDK gerencia armazenamento local, renovação e eventos de sessão. Nunca armazenamos senhas. Chamadas de rede têm limite de tempo. Não há chamadas Supabase assíncronas dentro dos callbacks de autenticação, evitando bloquear o lock de sessão.

A recuperação usa PKCE: iniciar o pedido e abrir o link no mesmo navegador e na mesma origem. Os e-mails locais são capturados pelo Mailpit. A mensagem de solicitação não confirma se o e-mail está cadastrado. O formulário de nova senha exige o evento de recuperação emitido pelo SDK; simplesmente abrir a URL com uma sessão comum não habilita a troca. O evento também é capturado antes da montagem da tela React.

Nesta primeira versão, recarregar a página de nova senha perde o marcador de recuperação em memória: solicitar um novo link. Links inválidos, expirados ou abertos em outro navegador não habilitam o formulário. Após atualizar a senha, a aplicação tenta encerrar a sessão local e voltar ao login. Se a saída falhar, informa que a senha foi atualizada e mantém o botão de saída disponível.

Sair encerra a sessão deste navegador. Não é promessa de revogação imediata de todos os tokens ou de sessões em outros dispositivos. A política de sessões globais e o envio de e-mails em produção serão revisados antes da publicação.

## Roteiro de validação real (pendente)

1. Sem `.env.local`, abrir a área de acesso e confirmar a mensagem de configuração ausente; o portfólio deve continuar funcionando.
2. Com configuração e migração aplicadas, testar senha errada, e-mail inexistente e rede indisponível. Não deve aparecer acesso administrativo.
3. Entrar como fotógrafo, recarregar a tela e confirmar restauração da sessão. Sair e confirmar que a área protegida deixa de ser exibida.
4. Entrar como visitante. Confirmar a mensagem de conta sem permissão e a impossibilidade de ler rascunhos pela API.
5. Para testar revogação, remover **somente o UUID da conta de teste do fotógrafo** de `private.administrators` no Studio e voltar o foco à aplicação. O acesso deve ser negado. Reaplicar a concessão acima após o teste.
6. Solicitar recuperação, abrir o e-mail no Mailpit e seguir o link no mesmo navegador. Testar confirmação divergente, senha curta, nova senha válida e entrada posterior com a nova senha.
7. Reabrir o link usado, testar link expirado e acesso direto a `/?acesso=nova-senha`: não devem habilitar recuperação indevidamente.
8. Conferir foco, labels, mensagens, teclado, largura de celular e mudança de abas. Voltar ao portfólio e verificar galeria e visualizador.

Registrar resultados reais em `docs/andamento.md`. Os 43 testes automatizados da etapa 5 não substituem esse roteiro nem validam o ciclo completo de login no navegador.

## Referências

- [Autenticação com senha](https://supabase.com/docs/guides/auth/passwords)
- [Eventos de sessão](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [Recuperação de senha](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
- [Testar autenticação e Mailpit](https://supabase.com/docs/guides/auth/testing-auth-flows)
