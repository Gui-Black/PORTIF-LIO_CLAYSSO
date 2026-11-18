# Lançamento com domínio próprio

Revisão de 17 de novembro de 2026. Domínio escolhido pelo usuário:
`clicksdomorty.com`. Hospedagem escolhida: Cloudflare Pages, mantendo o Supabase.
O domínio ainda não foi comprado e nenhum projeto Cloudflare foi criado.
Produção e Preview existentes na Vercel permanecem disponíveis.

## Revisão das dependências

`npm audit --json` confirmou 11 entradas altas originadas de uma vulnerabilidade
transitiva de `picomatch`, propagada pelas ferramentas Vite e TypeScript ESLint.
`npm explain picomatch` confirma uso apenas em desenvolvimento.
`npm audit --omit=dev --json` retornou zero vulnerabilidades.

Na consulta de 17/11, a versão mais recente no registro oficial npm é `4.0.7`,
ainda afetada, e o aviso do GitHub não informa versão corrigida. Não substituir
por uma versão inexistente nem aceitar o downgrade amplo sugerido pelo audit.
Nenhuma dependência ou lockfile foi alterado nesta revisão.

O deploy serve `dist` como arquivos estáticos; não executar nem expor o servidor
de desenvolvimento Vite na internet. Não há funcionalidade no site que receba
padrões glob do visitante para executar no build. Isso limita a exposição neste
projeto, mas não corrige a dependência; manter o alerta acompanhado.

Referências: [aviso do mantenedor](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)
e [código do pacote](https://github.com/micromatch/picomatch).

## Preparação local

- Canonical, Open Graph, dados estruturados, metadados de navegação e sitemap
  preparados para `https://clicksdomorty.com/`.
- `_headers` em `public` preserva o bloqueio de indexação no Cloudflare Pages,
  que não usa `vercel.json`. HTML, hook de metadados e `robots.txt` continuam
  bloqueando a indexação até a conclusão do lançamento.
- `.node-version` fixa Node.js `24.22.2`, versão usada neste projeto.
- A aplicação conserva React, Vite, GSAP e Supabase. Nenhuma migration, política,
  bucket, conta administrativa ou configuração de Auth foi alterada.
- O usuário já aprovou visual e fluxo administrativo na etapa anterior.
  Esses testes não comprovam login, recuperação ou upload no domínio novo.

## Publicar no Cloudflare Pages

Validação local concluída: `npm run check` aprovado com lint, formatação,
73 testes, TypeScript e build. A saída contém `_headers`, `robots.txt` e sitemap
preparados para esta etapa. O usuário confirmou as autorizações para conectar
o repositório e executar commit/push desta preparação. A tela autenticada do
Cloudflare Pages já mostra `Gui-Black/PORTIF-LIO_CLAYSSO` selecionado, branch
`main`, na etapa de configuração do build. Nenhuma nova concessão de acesso
foi executada pelo assistente após essa confirmação.

Usar o repositório privado existente por GitHub, sem ampliar acesso para outros
repositórios. A autorização de commit/push desta entrega não autoriza envios
automáticos de alterações futuras fora desse escopo.

| Configuração       | Valor                                                 |
| ------------------ | ----------------------------------------------------- |
| Produto            | Pages, sem Functions ou Worker de aplicação           |
| Nome sugerido      | `clicks-do-morty`                                     |
| Repositório        | `Gui-Black/PORTIF-LIO_CLAYSSO`                        |
| Branch de produção | `main`                                                |
| Diretório raiz     | raiz do repositório                                   |
| Build              | `npm ci && npm run check`                             |
| Saída              | `dist`                                                |
| Node.js            | `24.22.2`, por `.node-version`                        |
| Variáveis          | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`  |
| Contato opcional   | `VITE_WHATSAPP_NUMBER`, só após confirmação do número |

Usar os valores públicos do Supabase remoto existente; nunca localhost,
`service_role`, senha de banco ou chave secreta. Configurar Production e Preview
de modo explícito. Eles compartilham os dados se usarem o mesmo Supabase.
As variáveis Vite entram no JavaScript do visitante e exigem novo build.

Uma integração Git publica os próximos pushes da `main` automaticamente;
confirmar essa configuração no painel antes de habilitá-la. Não criar pipeline,
token persistente ou instalar CLI global apenas para esta migração.

## Domínio e custo

Consulta somente de leitura à Vercel: `clicksdomorty.com` disponível, não premium,
US$ 12,03 pelo primeiro ano e renovação atual de US$ 12,03 por ano. Disponibilidade,
preço final, impostos e câmbio podem mudar. Nenhuma compra ou renovação foi feita.
Esse preço é da Vercel, não uma cotação do registrador Cloudflare.

Na mesma revisão, a busca autenticada no registrador Cloudflare confirmou
`clicksdomorty.com` disponível por **US$ 11,17**, com renovação atual de
**US$ 11,17/ano**. Nenhum domínio foi adicionado ao carrinho ou comprado.

É possível registrar onde o usuário preferir. Para usar o domínio raiz com Pages,
a zona DNS deve ficar na mesma conta Cloudflare do projeto, com os nameservers
indicados pela conta. Se o domínio for comprado na Cloudflare, essa etapa é
integrada. Se for comprado em outro registrador, manter a titularidade lá e
apontar os nameservers corretos; não presumir registros universais.

Depois de registrar, adicionar o domínio em Pages > Custom domains e aguardar
verificação DNS e HTTPS. Cadastrar também `www` e definir um redirecionamento
para o domínio principal, preservando query strings e links dos álbuns.
Não criar registros antes de conferir os valores fornecidos pelo painel.

## Conferência final no domínio

1. Confirmar HTTPS e acesso público sem autenticação da hospedagem.
2. Conferir galeria, álbum, lightbox, imagens e Instagram nas telas de celular.
3. Entrar com a conta administrativa existente em `/?acesso=entrar`.
4. No Supabase Auth, revisar Site URL e autorizar exatamente
   `https://clicksdomorty.com/?acesso=nova-senha`; testar recuperação no navegador
   que iniciou o pedido. Mudança de origem não transfere a sessão anterior.
5. Validar upload e publicação somente em conteúdo autorizado. Não criar contas
   nem publicar material de teste no catálogo real automaticamente.
6. Liberar a indexação pública em conjunto: meta robots de `index.html`, hook
   `usePageMetadata.ts`, `public/robots.txt` e `public/_headers`. Manter a área
   administrativa com `noindex` e sem canonical, e os Previews fora da indexação.
   As rotas administrativas por query string não são protegidas por um simples
   bloqueio de caminho; preservar autenticação, autorização e RLS.
7. Publicar o build revisado, conferir respostas HTTP e sitemap no domínio final.

Não considerar o `.com` publicado antes de concluir registro, DNS, HTTPS e a
verificação no endereço real. O Preview anterior da Vercel permite comparação;
reverter o frontend não reverte banco, usuários ou arquivos do Supabase.

Referências oficiais:
[React no Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/),
[cabeçalhos](https://developers.cloudflare.com/pages/configuration/headers/),
[domínio próprio](https://developers.cloudflare.com/pages/configuration/custom-domains/),
[ambiente de build](https://developers.cloudflare.com/pages/configuration/build-image/)
e [limites gratuitos](https://developers.cloudflare.com/pages/platform/limits/).
