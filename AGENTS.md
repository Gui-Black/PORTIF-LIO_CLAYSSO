# Click’s do Morty

Portfólio fotográfico em React, TypeScript e Vite. Supabase fornece Auth,
PostgreSQL e Storage; a hospedagem existente é Vercel. Evoluir a implementação
atual em mudanças pequenas, preservando dados e contratos.

## Arquitetura e código

- `src/app`: composição, navegação e estilos globais.
- `src/features/home` e `portfolio`: narrativa, catálogo público e lightbox.
- `src/features/auth` e `work-management`: acesso e edição administrativa.
- `src/lib`: funções compartilhadas e configuração. Separar regras puras do I/O.
- Tipar fronteiras, tratar carregamento, falha, retomada e concorrência.
- Preservar links diretos, histórico, posição de rolagem e restauração de foco.
- Não reescrever funcionalidades existentes sem uma necessidade demonstrada.

## Direção visual e acessibilidade

- Manter estética editorial: creme, preto, terracota, serifas e fotografia.
- Preservar originais; derivados de imagem não substituem o acervo.
- Conferir 320, 390, 768 e 1440 px, textos longos e catálogos vazios ou pequenos.
- Garantir teclado, foco visível, descrições de imagens e controles de toque.
- Animações devem respeitar movimento reduzido, ter limpeza e não esconder
  conteúdo se o módulo de movimento falhar. Preferir transform e opacity.
- Usar GSAP existente quando houver benefício. Não adicionar rolagem artificial
  ou 3D sem justificativa e medição.

## Supabase e segurança

- Nunca expor secrets ou service_role no frontend, logs ou documentação.
- O catálogo público não herda a sessão administrativa.
- Autorização efetiva pertence ao servidor e às políticas RLS.
- Não executar migrations, alterar RLS/buckets, apagar dados ou criar acessos
  administrativos sem autorização explícita para a operação.
- Preservar publicação por versões, revisão otimista e retomada de uploads.
- Validar logs/advisories e documentação atual antes de mudanças no backend.
- Não confundir testes SQL em memória com validação do serviço hospedado.

## Dependências e skills

- Preferir recursos existentes. Justificar e revisar origem, licença, scripts e
  compatibilidade antes de instalar ferramentas externas; fixar versões.
- Skills complementam as regras deste projeto. Não afirmar uso de skill ausente.
- Não habilitar hooks, instaladores globais ou modos que ignorem aprovações e
  isolamento. Nenhuma ferramenta de design deve alterar produção diretamente.

## Verificação e entrega

- Executar `npm run check` antes da entrega: lint, formato, testes, tipos e build.
- Testar regressões concretas em catálogo, permissões, publicação e uploads.
- Validar visualmente mudanças de interface; informar limites dos testes.
- Documentar decisões relevantes e comandos de manutenção, sem secrets.
- Fornecer resumo, arquivos, resultados, pendências e sugestão de commit.

## Git e deploy

- Conferir branch e status; preservar alterações preexistentes.
- Não usar reset destrutivo, force push, commit ou push automáticos.
- Commits e pushes exigem autorização explícita; trabalhar em entregas pequenas.
- Não publicar nem mudar configuração de produção sem autorização específica.
- Validar em Preview antes de produção. Nome de domínio não comprova ambiente.
- Preservar noindex nesta fase; habilitar indexação pública somente no lançamento
  aprovado, mantendo a área administrativa fora da indexação.
