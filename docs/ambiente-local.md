# Supabase no computador

## Objetivo e estado

Executar PostgreSQL, Auth e Storage localmente antes de integrar o login. O Docker executa os serviços em containers; a CLI Supabase coordena a inicialização. Não é necessário criar projeto remoto, fazer login na CLI ou vincular conta.

A CLI 3.0.0 está fixada nas dependências de desenvolvimento. Sua versão e ajuda foram executadas com sucesso. O usuário instalou Docker Desktop; o executável foi localizado na instalação por usuário e informou versão de cliente 29.9.2. O contexto aponta para o motor Linux local. A sessão automatizada recebeu `permission denied` ao consultar o Docker; a versão efetiva do PostgreSQL e o histórico integral de migrações ainda não foram conferidos.

Em 7 de novembro de 2026, o usuário compartilhou a execução bem-sucedida de `supabase:check` e, após iniciar os serviços, de `supabase:verify` no seu PowerShell. Foram confirmados Auth respondendo, cinco categorias públicas, trabalho/versão demonstrativos existentes e ocultos ao visitante e bucket `portfolio` privado. Login, uploads, URLs assinadas e concorrência continuam pendentes. A aprovação desse diagnóstico não equivale à conclusão de toda a integração.

O site continua funcionando com `npm run dev`, sem Docker ou variáveis de ambiente.

## Preparação no Windows

1. Instalar [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/) seguindo os requisitos do instalador. Usar o backend WSL 2 e containers Linux. A preparação do WSL/virtualização pode exigir permissões administrativas e reinicialização.
2. Abrir o Docker Desktop, concluir a configuração e aguardar o motor iniciar.
3. Abrir um novo terminal na pasta do projeto. Se as dependências ainda não estiverem instaladas, executar `npm ci`.
4. Executar `npm run supabase:check`. Esse comando consulta o contexto e o motor Docker local e a versão da CLI; não inicia serviços nem cria rede.
5. Executar `npm run supabase:start`. A primeira inicialização baixa imagens e pode demorar. Aguardar as verificações de saúde terminarem sem erros.

Não instalar outra CLI global para este projeto. Os atalhos usam a versão do arquivo de dependências.

### Docker instalado, mas acesso negado nesta sessão

O diagnóstico distingue instalação ausente, motor inacessível e falta de permissão. No Windows, os atalhos procuram também nos diretórios usuais de instalação do Docker Desktop, caso o terminal ainda tenha o PATH anterior à instalação. O caminho é aplicado somente aos processos filhos; o PATH do Windows não é alterado.

Se a sessão automatizada receber acesso negado, abrir um PowerShell normal pelo próprio usuário, na raiz do projeto, e executar:

```powershell
npm run supabase:check
```

Somente se a verificação passar, executar `npm run supabase:start`. Se falhar também nesse terminal, enviar apenas a mensagem de erro para diagnóstico. Não reinstalar Docker com base apenas em uma recusa de acesso desta sessão. A saída completa de início/status pode conter credenciais locais e não deve ser compartilhada.

## Comandos

| Comando                   | Efeito                                                                      |
| ------------------------- | --------------------------------------------------------------------------- |
| `npm run supabase:check`  | Conferir Docker local/Linux e versão da CLI                                 |
| `npm run supabase:start`  | Preparar/reutilizar rede local e iniciar os serviços                        |
| `npm run supabase:status` | Consultar endpoints e credenciais locais; não compartilhar a saída completa |
| `npm run supabase:verify` | Conferir Auth, seed, privacidade do rascunho e bucket sem exibir chaves     |
| `npm run supabase:stop`   | Parar os serviços deste projeto preservando os dados                        |
| `npm run dev`             | Iniciar a interface React, independente dos serviços nesta etapa            |
| `npm run check`           | Executar lint, formatação, testes e build sem precisar de Docker            |

Os atalhos não aceitam argumentos adicionais e não oferecem comandos remotos ou de exclusão. Não usar `stop --no-backup`, `stop --all` ou reset para simplesmente encerrar o desenvolvimento.

O script verifica que o Docker usa um socket local e containers Linux. No início, cria ou confere a rede `clicks-do-morty-local`, com a opção `com.docker.network.bridge.host_binding_ipv4=127.0.0.1`, e a passa à CLI. Uma rede existente com configuração diferente causa erro e é preservada para revisão. Essa configuração segue a orientação de isolamento do Supabase; a exposição efetiva das portas ainda deve ser conferida após o primeiro início real.

## Acessos esperados

| Serviço                       | Endereço/porta configurada                                        |
| ----------------------------- | ----------------------------------------------------------------- |
| Interface Vite                | `http://localhost:5173` (usar o endereço informado pelo terminal) |
| Studio local                  | `http://127.0.0.1:54323`                                          |
| API Supabase                  | `http://127.0.0.1:54321`                                          |
| PostgreSQL                    | `127.0.0.1:54322`                                                 |
| Banco temporário de migrações | `54320`                                                           |

Esses endereços do Supabase só ficam disponíveis depois da inicialização bem-sucedida. Não encaminhar portas no roteador nem criar túneis públicos. O Studio local é uma ferramenta administrativa.

## Dados e credenciais

Os atalhos definem `SUPABASE_HOME` como `.supabase/runtime` dentro do projeto, usando a opção oficial da CLI. Isso mantém o estado dessa execução em um diretório gravável e fora do Git. Usar sempre os atalhos para não misturar esse estado com a configuração padrão da CLI em outro diretório. `.supabase/` e os arquivos `.env` locais são ignorados. O estado da CLI não substitui backup dos volumes Docker; não apagar nenhum deles para solucionar erros sem conferir os dados.

O seed contém somente dados fictícios e não cria contas, administradores ou fotos. Usar contas e imagens de teste nas próximas validações. Não colocar senhas, chaves administrativas ou tokens em arquivos versionados, capturas de tela ou mensagens.

Ainda não há cliente Supabase no React e nenhuma variável de ambiente precisa ser preenchida agora. Quando conectarmos a interface, ela receberá somente URL local e chave pública adequada. Chaves secretas/`service_role` nunca entram em variáveis `VITE_*`, pois essas variáveis são incluídas no código enviado ao navegador.

## Validação após instalar Docker

Depois que `npm run supabase:start` concluir com sucesso, executar na mesma pasta:

```powershell
npm run supabase:verify
```

O comando lê o status da CLI em memória e faz somente requisições GET à API local. Não cria contas, não altera dados e não salva nem imprime as chaves. Usa a chave pública para leituras de visitante e a chave privilegiada local somente para confirmar que o rascunho existe e que o bucket é privado. Essa chave não é enviada ao React. Destinos externos e redirecionamentos são recusados.

A saída desse comando pode ser compartilhada para diagnóstico: contém mensagens fixas e códigos HTTP, sem corpos de respostas ou credenciais. As verificações dependem do seed original, incluindo o trabalho e a versão ainda em rascunho. Se esses dados foram alterados, o comando falha para revisão; não executar reset automaticamente.

Um resultado aprovado confirma somente saúde do Auth, categorias públicas, existência/ocultação do rascunho ao visitante e configuração privada do bucket. Não confirma histórico integral de migrações, versão PostgreSQL, login, permissões de usuários autenticados, upload real, URLs assinadas, concorrência ou exposição efetiva das portas. Esses itens continuam no roteiro:

- Confirmar início saudável e acesso ao Studio; registrar versões reais de CLI/PostgreSQL.
- Confirmar tabelas, migrações, seed e bucket privado `portfolio`.
- Conferir as portas publicadas pelo Docker e sua restrição ao localhost.
- Repetir a matriz de permissões com chamadas reais de Auth, PostgREST e Storage.
- Validar upload/bytes, URLs assinadas e concorrência com conexões independentes.
- Só então integrar login, sessão e recuperação de senha da etapa 5.

Os testes atuais em memória e os testes do script com respostas simuladas não substituem essa conferência.

## Reconstrução de dados descartáveis

Reset apaga os dados do banco local antes de reaplicar migrações e seed. Não executar se houver dados que devam ser preservados. Para um reset deliberado, após conferir que o Docker é local, no PowerShell da raiz do projeto:

```powershell
npm run supabase:check
# Continuar apenas se a verificação acima terminar com sucesso.
$env:SUPABASE_HOME = Join-Path (Get-Location) '.supabase/runtime'
npx --no-install supabase db reset --local
```

Não há atalho de reset para evitar exclusão acidental. Para erros de inicialização, verificar primeiro se o Docker terminou de abrir, se as portas estão livres e se o terminal reconhece `docker`.

## Referências

- [Desenvolvimento local Supabase](https://supabase.com/docs/guides/local-development)
- [Docker e runtime nativo](https://supabase.com/docs/guides/local-development/docker-and-native-runtimes)
- [Estado e SUPABASE_HOME da CLI](https://github.com/supabase/cli/blob/develop/apps/cli/docs/supabase-home.md)
