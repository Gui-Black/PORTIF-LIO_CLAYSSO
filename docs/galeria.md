# Etapa 3 — galeria com dados locais

## Entrega

- Seção Trabalhos com filtros para Todos, Ensaios, Casamentos, Aniversários, Eventos e Produtos.
- Duas seleções editoriais provisórias usando as seis fotos JPEG fornecidas.
- Mensagem de categoria vazia e ação para retornar a todas as seleções.
- Detalhe com fotos inteiras e endereço que pode ser copiado da barra do navegador.
- Visualizador modal com anterior, próxima, setas do teclado, gesto horizontal e fechamento com Escape.
- Navegação circular no visualizador, bloqueio da rolagem de fundo e retorno do foco à foto acionada.
- Fallback de imagem indisponível e trabalho não encontrado.
- Retorno à listagem com filtro, posição e foco preservados quando a entrada veio de um cartão.

## Organização

`portfolio-data.ts` descreve categorias, fotos e trabalhos, além das consultas sobre esse conjunto local. Não há requisição ao Supabase nesta etapa.

`PortfolioSection` apresenta filtros e cartões. `WorkPage` apresenta um trabalho e guarda qual foto está aberta. `PhotoViewer` cuida do diálogo, dos atalhos e dos gestos. `PortfolioImage` trata falhas no carregamento da imagem. Estilos ficam em `portfolio.css`.

`navigation.ts` reúne a integração com o histórico do navegador. `App` observa mudanças da URL com `useSyncExternalStore` e seleciona a tela. Os filtros são gravados com `replaceState`, sem criar uma entrada no histórico para cada clique. Abrir um trabalho usa `pushState`, salva a posição e o cartão de origem na entrada anterior. Voltar usa o histórico quando há origem conhecida; links diretos retornam à galeria sem sair do site.

## Endereços

| Destino              | Endereço local relativo                                 |
| -------------------- | ------------------------------------------------------- |
| Galeria              | `/#trabalhos`                                           |
| Casamentos           | `/?categoria=casamentos#trabalhos`                      |
| Seleção de casamento | `/?categoria=casamentos&trabalho=entre-lacos-e-abracos` |
| Seleção de retratos  | `/?trabalho=retratos-no-jardim`                         |
| Categoria sem fotos  | `/?categoria=produtos#trabalhos`                        |
| Trabalho inexistente | `/?trabalho=inexistente`                                |

Parâmetros de consulta evitam depender de reescrita de rotas neste protótipo estático. O título da aba muda no cliente. Isso não implementa renderização no servidor, metadados sociais específicos ou status HTTP 404. Essa estratégia será resolvida antes da integração definitiva das páginas públicas. A diretiva `noindex` permanece.

## Verificações automatizadas

`npm run check` inclui oito testes do executor nativo do Node. Eles cobrem integridade das fotos e capas, filtros, endereços, limites do índice do visualizador, distinção entre gesto lateral e vertical, histórico simulado, retorno de link direto e cliques modificados para abrir novas abas.

Os testes de histórico usam uma simulação da API. Eles não validam foco nativo, layout, gesto real, leitura por tecnologia assistiva ou comportamento de um navegador real.

## Roteiro no navegador

Executar `npm run dev`, abrir o endereço do terminal e conferir em desktop e em larguras de 375 px e 320 px.

1. Entrar em Trabalhos pelo menu. Filtrar Casamentos e depois Produtos. Conferir a contagem e a mensagem vazia, e retornar a Todos.
2. Abrir uma seleção. Verificar o título, a descrição e todas as fotografias. Recarregar e copiar o endereço para uma nova aba.
3. Voltar à galeria. Conferir o filtro, a posição e o foco no cartão original. Usar também os botões Voltar e Avançar do navegador.
4. Abrir cada foto pelo teclado e pelo toque. Verificar que Tab permanece no diálogo e que Escape devolve o foco à foto acionada.
5. Navegar com setas e botões. Na última foto, avançar para a primeira. Na primeira, voltar à última.
6. No celular, deslizar lateralmente. Conferir que gesto vertical ou toque curto não muda a foto e que o zoom por pinça continua disponível.
7. Abrir um trabalho inexistente e retornar à galeria. Bloquear uma imagem nas ferramentas do navegador para avaliar a mensagem de indisponibilidade.
8. Conferir recortes dos cartões, fotos inteiras no detalhe, contraste, movimento reduzido e ausência de rolagem horizontal.

A prévia integrada retornou erro e o navegador integrado não estava disponível nesta sessão. Este roteiro permanece pendente.
