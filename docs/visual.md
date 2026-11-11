# Direção visual — etapas 2 e 8

## Refinamento de movimento — 11 de novembro de 2026

Referências pesquisadas: [35mm no Supahero](https://supahero.io/hero/35mm), [Did Global Cinema no Supahero](https://supahero.io/hero/did-global-cinema), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) e [gsap.matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>). As referências orientam uma apresentação centrada nas fotografias; nenhum template, foto ou código desses portfólios foi copiado.

- Entrada sequenciada dos elementos da abertura e expansão suave do enquadramento da foto principal.
- Movimento vertical discreto da foto principal durante a rolagem, apenas a partir de 760 px.
- Revelação das fotografias de celebração e abraço ao entrarem na tela, preservando as dimensões do layout.
- Barra decorativa de progresso no topo e resposta visual no convite para rolar, inclusive com foco pelo teclado.

GSAP 3.15.1 e ScrollTrigger ficam em um módulo carregado dinamicamente pela página inicial. O hook desfaz animações, observadores e agendamentos ao desmontar; `matchMedia` reverte os efeitos ao ativar movimento reduzido. A rolagem continua nativa. Falha no carregamento do módulo mantém conteúdo e navegação disponíveis, com as revelações nativas anteriores. A animação de abertura não se repete quando a página retorna em uma posição de rolagem mais abaixo.

Não houve publicação nesta entrega. Conferir localmente em desktop e celular: entrada inicial, âncoras, rolagem até o rodapé, galeria carregada após a página, retorno de um trabalho e alteração de movimento reduzido durante a sessão. Validação visual em navegador permanece pendente; verificações automatizadas não comprovam a aparência nem a fluidez.

## Evolução da etapa 8

A página tem seis cenas: abertura, pessoas e histórias, atmosfera escura, galeria, experiência antes do primeiro clique e contato. A nova seção `#experiencia` usa a fotografia de abraço já fornecida, com enquadramento em CSS, e apresenta três passos de conversa em linguagem simples. O texto é editorial e ainda precisa de aprovação de Claysso; não estabelece preços, prazos ou condições de contratação.

O menu inclui **A experiência**. A transição de fundo responde à rolagem tanto na cena escura quanto na nova seção; os elementos entram suavemente na tela. A rolagem permanece nativa, sem prender a tela ou avançar automaticamente. Com movimento reduzido, o conteúdo aparece sem essas transições. Não foram adicionadas bibliotecas de animação.

Legendas e textos pequenos da página inicial foram ampliados. A nova seção vira uma coluna no celular, e o cabeçalho economiza espaço em tablets. A chamada final orienta o visitante a informar tipo de fotografia, data e local pelo Instagram já configurado.

Lint, formatação, 59 testes, TypeScript e build passaram. O servidor visual temporário iniciou, mas a tentativa de captura com Edge não produziu imagem. A aparência, a rolagem e os recortes **não foram validados visualmente** nesta sessão. Conferir em 320, 375, 768 e 1440 px, incluindo navegação por teclado, menu, âncoras, movimento reduzido e retorno da galeria.

Não há nova migração nesta entrega. A galeria integrada depende das migrações das etapas anteriores. Novas fotografias, seleção editorial definitiva, WhatsApp confirmado, compressão e metadados das imagens continuam pendentes antes do lançamento.

A demonstração explora a passagem entre uma abertura acolhedora, um retrato de celebração e uma cena escura com fotografia em preto e branco. O objetivo é avaliar o ritmo e a personalidade antes de construir a galeria.

## Escolhas

- Papel claro, grafite com fundo esverdeado e terracota nos destaques.
- Títulos com fontes serifadas disponíveis no sistema e texto com Segoe UI ou Arial. A aparência pode variar entre sistemas.
- Imagens grandes, poucas ações por seção e espaço para leitura.
- Revelação suave dos elementos e transição de fundo ligada à rolagem nativa.
- Menu em telas menores que 760 px, navegação por âncoras, foco visível e link para pular ao conteúdo.
- Respeito a `prefers-reduced-motion`, mantendo o conteúdo visível sem animações.

## Fotografias recebidas

As sete fotos adicionadas pelo usuário em `dist/assets` foram copiadas integralmente para `assets/fotografias` antes do build. Essa pasta preserva os arquivos recebidos e não é publicada pelo Vite. O arquivo HEIC permanece guardado e não é usado no navegador.

| Arquivo recebido    | Arquivo servido                         | Uso                          |
| ------------------- | --------------------------------------- | ---------------------------- |
| `IMG_2030.JPG.jpeg` | `public/images/retrato-noiva.jpeg`      | Abertura                     |
| `IMG_2071.JPG.jpeg` | `public/images/celebracao.jpeg`         | Pessoas e histórias          |
| `IMG_2044.JPG.jpeg` | `public/images/noiva-preto-branco.jpeg` | Ambiente escuro              |
| `IMG_2034.JPG.jpeg` | `public/images/retrato-jardim.jpeg`     | Galeria de retratos          |
| `IMG_2041.JPG.jpeg` | `public/images/abraco.jpeg`             | Galeria de casamento         |
| `IMG_2114.JPG.jpeg` | `public/images/casal.jpeg`              | Capa da seleção de casamento |

As cópias utilizadas mantêm os arquivos sem edição. O enquadramento na tela é feito pelo CSS. Não há imagens de banco na versão entregue.

Na etapa 3, seis fotos estão disponíveis na galeria. Os títulos das duas seleções e a associação dos retratos à categoria Ensaios são provisórios, para demonstrar a navegação. Não foram inventados nomes de clientes, datas, locais ou depoimentos. Os agrupamentos deverão ser confirmados com Claysso.

`dist` é uma saída gerada e pode ser apagada pelo próximo build. Novas fotos devem ser guardadas em `assets/fotografias`; somente as escolhidas para a página devem ser copiadas para `public/images`. Antes do lançamento, avaliar formatos responsivos, compressão e remoção de metadados das cópias públicas.

## Avaliação pendente

Abrir com `npm run dev` e conferir em desktop e viewport móvel de 375 px e 320 px. Observar recortes, legibilidade, ausência de rolagem horizontal, menu, fechamento com Escape, âncoras, navegação por Tab e movimento reduzido. A conferência visual automatizada ficou bloqueada nesta sessão.

O contato atual aponta ao Instagram informado. O número do WhatsApp e os textos definitivos serão confirmados antes da publicação.
