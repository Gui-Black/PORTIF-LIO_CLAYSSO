# Direção visual da etapa 2

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
