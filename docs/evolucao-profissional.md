# Evolução profissional — 17 de novembro de 2026

## Escopo e preservação

Implementação local aprovada após diagnóstico. Sem commit, push ou deploy.
Preservada a alteração preexistente em `docs/preview-online.md`. Nenhuma migration,
política RLS, configuração de Auth ou bucket foi alterada. O Supabase remoto
`clicks-do-morty-preview` foi reativado com autorização: de `INACTIVE` para
`ACTIVE_HEALTHY`. A leitura confirmou cinco categorias, um trabalho publicado,
11 fotos prontas e bucket `portfolio` privado, limitado a 10 MiB.

## Decisões de implementação

### Disponibilidade do catálogo

`catalog-selection.ts` separa montagem do catálogo e chamadas externas. Uma URL
individual ausente ou metadados inválidos não derrubam outros trabalhos. Foto
sem URL autorizada não é apresentada; álbum sem capa válida é omitido. Um aviso
explica a disponibilidade parcial e permite nova tentativa. Falhas de rede,
permissão ou consulta continuam sendo erros; não geram conteúdo demonstrativo.
A função pública anterior `loadPublishedWorks` mantém o retorno de lista.

Essa separação permite testar perdas parciais sem alterar banco ou fotografias.
O catálogo ainda consulta os metadados de todas as fotos antecipadamente. Adiar
fotos de detalhes é uma evolução futura, condicionada a medição com mais álbuns.

### Fotografias responsivas

`public/images/responsive` contém cópias JPEG de 480, 800 e 1206 px de largura.
O navegador escolhe com `srcset` e `sizes`; URLs assinadas do Supabase permanecem
intactas. Originais em `public/images` e `assets/fotografias` foram preservados.
O lightbox informa carregamento e continua exibindo falhas com texto alternativo.

Regenerar no Windows, na raiz do projeto:

```powershell
powershell -NoProfile -File scripts/prepare-images.ps1
```

O script usa o encoder JPEG nativo, qualidade 85, sem instalar bibliotecas.
A cópia principal de 480 px ocupa 58.646 bytes, ante 454.319 bytes do original
(redução de aproximadamente 87%). Isso não representa a economia de todas as
visitas: a variante escolhida depende da largura e densidade da tela.

WebP ficou pendente: Sharp e Pillow não estavam disponíveis e a consulta ao npm
falhou com `ENOTFOUND registry.npmjs.org`. Não foi alterado o lockfile. Antes de
adicionar um encoder futuro, revisar origem, versão, scripts e fidelidade visual.
Novas fotos institucionais exigem atualizar a lista de `responsive-images.ts` e
regenerar variantes. O upload administrativo mantém seu formato original.

### Interface e contato

- Hero com tipografia menor em telas estreitas para evitar uma palavra isolada.
- Escala do título ajustada também no tablet, onde a composição mantém duas colunas.
- Uma seleção ocupa uma composição central mais ampla no desktop.
- Troca de filtro e lightbox têm movimento breve, sujeito a movimento reduzido.
- Erros administrativos orientam retomada ou suporte, sem comandos de terminal.
- Contatos centralizados em `src/lib/contact.ts`.
- WhatsApp é opcional, via `VITE_WHATSAPP_NUMBER`, somente após confirmar DDI,
  DDD e número. Sem valor válido, o contato permanece no Instagram. Como variável
  Vite, o número é público e exige novo build para entrar em vigor.

### SEO e publicação

Metadados sociais, canonical, dados estruturados e sitemap inicial foram
preparados para o domínio atual. Descrições e título acompanham a navegação no
cliente. A área administrativa remove canonical e mantém noindex.

`noindex, nofollow`, o cabeçalho `X-Robots-Tag` e `robots.txt` continuam bloqueando
indexação nesta fase. Não liberar somente um deles no lançamento: revisar os três
em conjunto e validar que o administrativo permanece fora da indexação.
O sitemap contém só a página inicial; não inventa URLs de trabalhos de teste.

Pré-visualizadores sociais que não executam JavaScript recebem os metadados
genéricos do HTML. Compartilhamento específico por álbum exige prerenderização
ou renderização no servidor em uma entrega futura. Atualizar os endereços em
`index.html`, `usePageMetadata.ts`, `robots.txt` e `sitemap.xml` ao mudar o domínio.

`vercel.json` ainda desabilita deploy Git da `main`; não foi alterado. O nome
"preview" no domínio não determina o ambiente da Vercel. Confirmar integração,
branch e ambiente antes de autorizar publicação.

## Ferramentas e skills

Nenhuma dependência nova de frontend ou testes. Mantidos GSAP, rolagem nativa e
os testes Node/PGlite. Sem Lenis, Three.js ou instalação de hooks.

As quatro skills de design solicitadas não estavam instaladas e não foram
utilizadas. As origens identificadas são `pbakaus/impeccable`,
`emilkowalski/skills` e `Leonxlnx/taste-skill`. Instalação continua pendente da
disponibilidade de rede e da revisão dos arquivos da versão escolhida. Não
habilitar o modo Live do Impeccable com execução automática que ignore o sandbox.

## Observações do Supabase hospedado

Health advisor sem avisos. O security advisor informa:

- Oito funções `SECURITY DEFINER` executáveis por contas autenticadas. A leitura
  das definições confirmou verificação de `private.is_administrator()` e
  `search_path` fixo nas oito. Testes de banco cobrem recusa de usuários comuns.
  [Referência do advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- RLS sem políticas na tabela privada de administradores: acesso direto negado
  intencionalmente. [Referência](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- Proteção contra senhas vazadas desabilitada. Avaliar disponibilidade e custo no
  plano antes de habilitar; nenhuma configuração de Auth foi alterada.
  [Documentação](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

O performance advisor também apontou índices de chaves estrangeiras e políticas
permissivas sobrepostas. Registrar para análise quando houver volume; não criar
índices, remover políticas ou migrations apenas para zerar avisos.
Referências: [índices](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
e [políticas](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies).

## Validação e manutenção

`npm run check` aprovado: lint, formatação, 69 testes, TypeScript e build.
O navegador confirmou catálogo hospedado após a reativação e, na versão local
atualizada conectada ao mesmo Supabase, carregamento do álbum e de sua foto por
URL assinada. A sessão de teste pública não herda credenciais administrativas.

Na demonstração local, foram conferidos filtro com uma seleção, categoria vazia,
retorno ao álbum com restauração de foco, troca pelo teclado no lightbox e Escape.
Metadados do trabalho acompanham a navegação; na área privada, canonical ausente
e noindex presente. Sem rolagem horizontal nas larguras medidas de 320, 390, 768 e
1440 px. Gestos continuam cobertos pelos testes de lógica; não houve simulação
de toque físico nem medição de Core Web Vitals ou auditoria automática com axe.
Login autenticado, envio e publicação via painel continuam pendentes.

Executar `npm run check` e validar interface com `npm run dev`. Testes SQL usam
banco em memória e não equivalem a operações reais de login e upload.
Conferir catálogo parcial/vazio, filtros, retorno ao trabalho, lightbox, teclado,
gestos, imagens e viewports 320, 390, 768 e 1440 px. A inspeção autenticada de
upload/publicação requer sessão de teste autorizada; não criar contas ou dados
no ambiente compartilhado apenas para produzir evidência de teste.

Para revisão de commits, separar documentação, estabilidade do catálogo,
fotografias e interface. O usuário continua responsável por commit e push.
