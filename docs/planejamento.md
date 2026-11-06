# Planejamento do Click’s do Morty

## Contexto e autorização

Planejamento consolidado em 6 de novembro de 2026 a partir desta conversa. O nome público é provisório. O usuário aprovou iniciar somente a etapa 1, de preparação do ambiente, documentação e estrutura inicial.

O objetivo é apresentar a fotografia de Claysso em Guarulhos e São Paulo e facilitar o contato pelo WhatsApp e Instagram. O desenvolvimento também deve permitir ao usuário aprender conceitos e apresentar o projeto em seu currículo.

## Escopo aprovado

- Vitrine pública com ensaios, casamentos, aniversários, eventos e produtos.
- Página inicial com descoberta guiada pela rolagem.
- Listagem com filtros e uma página compartilhável para cada trabalho.
- Visualização ampliada e navegação por toque, mouse e teclado.
- Apresentação do fotógrafo, serviços e contatos.
- Painel próprio para gerenciar trabalhos, categorias, fotos e conteúdo do site.
- Edição por versões, mantendo a versão publicada enquanto um rascunho é preparado.
- Menor custo recorrente possível e uso inicial de franquias gratuitas.
- Código legível, funções bem estruturadas e aprendizado por pequenas entregas.

Instagram informado pelo usuário — <https://www.instagram.com/clicksmortyofc/>.

Os contatos definitivos e as fotos para publicação precisam ser confirmados. O WhatsApp visto na prévia do Instagram ainda não foi configurado na aplicação.

## Decisões técnicas

| Decisão                                   | Motivação e situação                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| React e painel próprio                    | Escolha explícita do usuário para aprender e ampliar seu portfólio profissional |
| TypeScript e Vite                         | Base proposta e incluída no plano aprovado para a preparação                    |
| Supabase                                  | Plataforma planejada para PostgreSQL, autenticação e armazenamento              |
| CSS                                       | Base de estilos com componentes e padrões visuais consistentes                  |
| Cloudflare Workers com arquivos estáticos | Hospedagem proposta, sujeita à validação da estratégia de páginas públicas      |
| Git e GitHub                              | Histórico em pequenas entregas, com remoto ainda pendente                       |

As versões concretas de desenvolvimento ficam registradas no arquivo de dependências. Preços e limites dos fornecedores devem ser revalidados antes de contratar ou publicar.

## Direção visual

O usuário destacou as entradas de textos e imagens e as mudanças de ambiente durante a rolagem na referência <https://www.g3.art.br/corporativo/>. A página não pôde ser inspecionada diretamente. O roteiro foi definido a partir da descrição do usuário e da imagem do Instagram fornecida na conversa.

A proposta combina off-white quente, grafite e detalhes em terracota. A tipografia final, as cores exatas e o enquadramento das imagens serão validados na etapa 2.

| Cena                | Conteúdo e experiência                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Primeira impressão  | Foto ampla, marca, frase curta e convite para explorar                                   |
| Pessoas e histórias | Fundo claro e quente, retratos e entradas suaves                                         |
| Celebrações         | Ambiente escuro, fotografias de casamentos, aniversários e eventos                       |
| Detalhes e produtos | Composição clara, espaçada e organizada                                                  |
| Fotógrafo           | Retrato e apresentação de Claysso, com fotografia fixa por um trecho curto no computador |
| Contato             | Convite acolhedor para conversar pelo WhatsApp ou Instagram                              |

As transições devem preservar a rolagem natural, a leitura e o controle do visitante. Entradas de texto entre 400 e 600 ms são uma hipótese para testes. No celular, os movimentos serão simplificados. A preferência por movimento reduzido será respeitada.

O visitante também terá acesso direto a Trabalhos, Sobre e Contato. Ao voltar da página de um trabalho, o planejamento prevê recuperar o filtro e a posição na listagem.

## Telas e administração

| Área    | Telas planejadas                                                                           |
| ------- | ------------------------------------------------------------------------------------------ |
| Público | Início, trabalhos, detalhe do trabalho e página não encontrada                             |
| Acesso  | Login e recuperação de acesso                                                              |
| Painel  | Lista de trabalhos, editor, categorias e serviços, página inicial e informações de contato |

O editor oferece informações, fotografias e revisão. Haverá salvamento explícito, indicação de alterações pendentes e aviso antes de abandonar uma edição. A ordenação terá arrastar e soltar e controles alternativos acessíveis.

Cada tela deverá prever carregamento, conteúdo disponível, vazio e erro. Mensagens de sucesso dependem da confirmação da operação.

## Modelo de dados aprovado

| Tabela prevista  | Responsabilidade                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `categories`     | Nome, descrição do serviço, endereço amigável e ordem                                       |
| `works`          | Identidade estável, endereço da página, versão publicada e destaque                         |
| `work_versions`  | Título, descrição, categoria, capa e conteúdo em edição ou publicado                        |
| `photos`         | Referência ao arquivo, descrição acessível, dimensões, ordem e enquadramento de cada versão |
| `site_settings`  | Marca, textos, imagens de apresentação, região e contatos públicos                          |
| `administrators` | Identificação explícita das contas autorizadas a administrar                                |

As contas serão gerenciadas pelo Supabase Auth. Cada versão terá uma categoria. O modelo prevê uma versão publicada e um rascunho por trabalho.

Na etapa 4 serão definidos os tipos SQL, índices, chaves estrangeiras e restrições, incluindo a garantia de que a capa pertence à versão e de que a versão publicada pertence ao trabalho. A ordem das fotos e a detecção de edições concorrentes serão tratadas de forma consistente.

A publicação será uma operação transacional. Deve verificar autorização, título, categoria, fotografias prontas e capa válida antes de trocar a versão pública. Restrições precisam valer também quando a operação é chamada fora da interface.

A remoção de uma categoria exige realocar os trabalhos associados, inclusive seus rascunhos. Referências entre versões e arquivos serão verificadas antes de qualquer exclusão física, para preservar imagens ainda utilizadas.

## Acesso e arquivos

- Visitantes consultam somente conteúdo publicado e configurações públicas do site.
- Administradores explicitamente autorizados gerenciam conteúdo e rascunhos.
- O painel inicial concentra funções de conteúdo. A concessão de acesso administrativo será uma configuração controlada fora desse painel.
- A proteção será aplicada por políticas no banco e no armazenamento.
- Arquivos de rascunhos ficam privados. A proposta aprovada usa armazenamento privado e links temporários para exibir as fotos publicadas.
- Links já emitidos podem continuar funcionando até a expiração. A navegação precisa renovar links expirados e tratar falhas de acesso.
- Imagens de abertura e retratos usados nas configurações também precisam de uma regra explícita de publicação.
- O upload e a atualização do banco são operações separadas. Cada foto terá progresso e recuperação de falha. Arquivos abandonados exigem limpeza controlada.
- O compartilhamento de uma página exige uma estratégia própria para a imagem de prévia e seus endereços. A compatibilidade com links temporários deve ser validada antes de concluir as páginas públicas.

## Organização do código

| Área prevista                  | Responsabilidade                                                |
| ------------------------------ | --------------------------------------------------------------- |
| `src/app`                      | Inicialização, rotas, estilos globais e composição da aplicação |
| `src/features/portfolio`       | Galeria pública e trabalhos                                     |
| `src/features/auth`            | Login, sessão e recuperação                                     |
| `src/features/work-management` | Edição, fotos, versões e publicação                             |
| `src/features/site-settings`   | Conteúdo institucional e contatos                               |
| `src/components/ui`            | Elementos de interface com uso compartilhado                    |
| `src/lib`                      | Integrações e configurações compartilhadas                      |
| `supabase/migrations`          | Evolução versionada do banco                                    |

Criar cada área junto de sua funcionalidade. Componentes apresentam conteúdo, funções de acesso aos dados concentram integrações e validações expressam as regras. Hooks devem reunir comportamento de estado quando houver benefício concreto.

## Plano de entregas

| Etapa | Entrega                                                      | Critério de conclusão                                                   |
| ----- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1     | Ambiente, documentação, React, TypeScript, lint e formatação | Execução local e verificações básicas aprovadas                         |
| 2     | Base visual e uma seção demonstrativa                        | Aprovação visual no computador e no celular                             |
| 3     | Galeria, filtros e detalhe com dados de exemplo              | Exploração completa por toque, mouse e teclado                          |
| 4     | Banco, restrições e permissões                               | Leitura pública restrita e edição autorizada verificadas                |
| 5     | Login, sessão e recuperação                                  | Fluxos funcionais e acesso indevido bloqueado                           |
| 6     | Cadastro, upload e publicação                                | Primeiro trabalho criado no painel e visível na galeria                 |
| 7     | Revisões, retirada, exclusão e recuperação                   | Versão publicada preservada e falhas recuperáveis                       |
| 8     | Seis cenas, animações e conteúdo real                        | Experiência aprovada em telas pequenas e grandes                        |
| 9     | Homologação, documentação e lançamento                       | Claysso administra um trabalho sozinho e critérios finais são cumpridos |

As etapas posteriores dependem das anteriores. A estratégia de renderização, busca e prévias de compartilhamento deve ser resolvida antes de integrar definitivamente as páginas públicas. A etapa 6 é o primeiro marco funcional completo.

## Qualidade, versionamento e aprendizado

Cada entrega deve incluir explicação breve dos conceitos, implementação, validação e revisão para commit. Usar `main` como referência estável e branches curtas por funcionalidade. O nome e o e-mail do autor e o remoto precisam ser definidos pelo responsável.

Testes planejados devem cobrir publicação transacional, tentativas repetidas, permissões de visitante e administrador, arquivos de rascunho, expiração dos links, uploads incompletos e alterações concorrentes. Avaliar também navegação por teclado, responsividade e movimento reduzido.

Os documentos de andamento devem diferenciar verificações executadas e planejadas. Funcionalidades são concluídas quando seus critérios são observados.

## Infraestrutura, custos e recuperação

Desenvolvimento local com dados de exemplo, homologação separada e produção com o conteúdo real. A proposta usa dois projetos Supabase para separar homologação e produção.

Na consulta de 6 de novembro de 2026, Supabase Free informa 500 MB de banco, 1 GB de arquivos, 5 GB de transferência e 5 GB de transferência em cache, com limite de dois projetos ativos e pausa após uma semana de inatividade. As franquias de transferência devem ser acompanhadas separadamente conforme o uso real.

A meta é começar com R$ 0 de mensalidade de infraestrutura dentro das franquias. Domínio e envio de e-mails são decisões separadas. Para login com senha e recuperação por e-mail, configurar um provedor SMTP adequado à produção. O serviço padrão do Supabase é destinado a testes e restringe destinatários.

Antes do lançamento, definir cópias dos registros e arquivos, retenção, teste de restauração e retorno à versão anterior do site. Uma reversão do frontend deve ser compatível com as migrações do banco. As fotos originais também devem permanecer sob guarda do fotógrafo.

## Pendências antes do lançamento

- Confirmar fotos, textos, contatos, marca definitiva e domínio.
- Validar tipografia, cores e movimentos em uma seção real.
- Resolver renderização, indexação e prévias de compartilhamento por trabalho.
- Confirmar hospedagem e configuração das rotas de páginas internas.
- Definir provedor e custos do envio de e-mails de recuperação.
- Validar políticas, publicação transacional e operações de arquivos com falhas.
- Definir cópias, retenção e restauração, e executar um teste de recuperação.
- Remover a diretiva provisória de bloqueio de indexação na publicação oficial.

## Fontes consultadas

- [Vite](https://vite.dev/guide/)
- [Preços do Supabase](https://supabase.com/pricing)
- [Políticas RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Armazenamento privado e público](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Envio de e-mails de autenticação](https://supabase.com/docs/guides/auth/auth-smtp)
- [Arquivos estáticos na Cloudflare](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
