# Efeitos visuais e composição dos álbuns

## Entrega de 18 de novembro de 2026

Evolução local da identidade editorial existente, sem dependências adicionais,
commit, push ou publicação. Preservados banco, autenticação, Storage e fotografias.

## Implementação

- Hero: quatro linhas semânticas com nome acessível único. Uma timeline GSAP
  coordena texto, chamada, recorte de entrada da imagem e legenda. A máscara
  estática não altera o tamanho das linhas nem esconde o texto sem animação.
- Galeria: cartões em composição alternada no desktop, com revelação discreta e
  atraso curto entre colunas. Seleções únicas e filtros vazios mantêm seus estados.
- Álbuns: foto vertical de abertura centralizada; horizontais recebem largura
  completa; retratos consecutivos formam pares com leve deslocamento vertical.
  Retratos sem par ficam centralizados. No celular, todas as fotos usam uma coluna.
- As imagens dos álbuns mantêm proporções naturais, sem recorte pelo novo layout.
  A ordem original e os índices do lightbox são preservados.
- Botões de ampliar e abrir seleção respondem a hover e foco; botões principais
  têm resposta breve ao pressionar. Não há cursores artificiais ou scroll preso.
- Revelação nativa compartilhada observa também conteúdo que chega depois da
  primeira renderização. Ao remover cartões ou desmontar páginas, listeners e
  observadores são liberados. Foco por teclado revela controles imediatamente.
- GSAP respeita prefers-reduced-motion e usa matchMedia/revert já existentes.
  O modo reduzido remove transições CSS e mantém conteúdo visível.

## Arquivos desta etapa

| Arquivo                                     | Responsabilidade                                         |
| ------------------------------------------- | -------------------------------------------------------- |
| src/features/home/HomePage.tsx              | Linhas do título e nome acessível                        |
| src/features/home/home-motion.ts            | Sequência de entrada do hero                             |
| src/features/home/home.css                  | Máscaras das linhas                                      |
| src/features/home/useScrollExperience.ts    | Movimento da home e hook compartilhado                   |
| src/lib/useScrollReveal.ts                  | Descoberta, revelação e limpeza de elementos             |
| src/features/portfolio/album-layout.ts      | Composição sem alterar ordem/índices                     |
| src/features/portfolio/WorkPage.tsx         | Álbuns e numeração editorial                             |
| src/features/portfolio/PortfolioSection.tsx | Revelação escalonada dos cartões                         |
| src/features/portfolio/portfolio.css        | Composição, pares, mobile e microinterações              |
| src/app/styles.css                          | Foco, atrasos e resposta dos botões                      |
| tests/album-layout.test.mjs                 | Preservação de ordem em álbuns mistos, pequenos e vazios |
| tests/public-availability.test.mjs          | Legibilidade estática e nome acessível do título         |

## Verificação

npm run check foi executado com sucesso: lint, Prettier, 73 testes, TypeScript
e build. Os testes de SQL/RLS continuam sendo executados em memória.
Os novos casos cobrem álbuns mistos, retratos sem par, fotos únicas e horizontais
consecutivas, além do HTML do título antes de carregar as animações.

A revisão visual desta etapa não pôde ser concluída. O navegador de automação
falhou por configuração de caminhos do ambiente; a alternativa nativa também
não encontrou seu executável de suporte. Não considerar as capturas e medições
visuais da entrega anterior como validação destes efeitos novos.

Roteiro pendente: conferir 320, 390, 768 e 1440 px; observar linhas serifadas,
primeira entrada, pares de retratos, filtros com poucos e muitos trabalhos,
voltar/avançar, foco, lightbox e movimento reduzido. Testar a preferência reduzida
antes e durante a navegação, inclusive quando a galeria chega de forma assíncrona.

## Manutenção

Ajustar ritmo e duração na timeline do hero. A composição usa a relação entre
largura e altura: a partir de 1,15 a foto é horizontal. Alterar essa regra em
album-layout.ts exige repetir os testes de preservação dos índices.
Não usar grid-auto-flow dense: a ordem visual deve seguir a ordem dos controles.
Não mudar as fotos no banco para produzir um efeito de layout.

Referências: [Timeline GSAP](https://gsap.com/docs/v3/GSAP/Timeline/)
e [matchMedia e limpeza](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/>).

Commit sugerido: feat: refina hero e composição editorial dos álbuns
