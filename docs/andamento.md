# Andamento do projeto

## Estado atual

Etapa 1 concluída e commitada pelo usuário. Etapa 2 autorizada em 6 de novembro de 2026, implementada e aguardando avaliação visual no computador e no celular.

## Etapa 2

- [x] Definir paleta, fontes e composição inicial.
- [x] Preservar as sete fotos recebidas fora de `dist`.
- [x] Usar três fotos reais fornecidas pelo usuário na demonstração.
- [x] Implementar cabeçalho responsivo e navegação por âncoras.
- [x] Implementar revelação pela rolagem e mudança de atmosfera.
- [x] Incluir foco visível, textos alternativos e movimento reduzido.
- [x] Verificar lint, formatação, tipos e build.
- [x] Verificar resposta HTTP da página e das três imagens.
- [ ] Conferir visual e interações no desktop e no celular.
- [ ] Receber aprovação visual da direção proposta.
- [ ] Revisar e commitar a entrega pelo usuário.

## Verificações executadas

| Verificação                        | Resultado                                                   |
| ---------------------------------- | ----------------------------------------------------------- |
| `npm run check`                    | ESLint, Prettier, TypeScript e build aprovados              |
| Página e imagens no servidor local | HTTP 200                                                    |
| Fotos preservadas                  | Sete arquivos em `assets/fotografias`; três cópias públicas |
| Conferência visual                 | Bloqueada nesta sessão                                      |

A abertura da prévia integrada retornou erro. A tentativa de usar o navegador disponível foi interrompida pela ferramenta porque ela não conseguiu determinar a URL atual com confiança. Assim, menu, teclado, recortes, responsividade e movimento reduzido foram implementados e revisados no código, mas ainda precisam de validação no navegador. HTTP e build não substituem essa avaliação.

Para abrir a demonstração, execute `npm run dev` e acesse o endereço mostrado no terminal. O roteiro de avaliação está em [Direção visual](visual.md).

O npm mantém um aviso sobre `http-proxy` do ambiente hospedeiro, sem impedir as verificações. Nenhuma dependência nova foi adicionada nesta etapa.

## Versionamento

O commit inicial `d340730` está na branch `main`, conectada ao GitHub. O usuário continuará fazendo os commits. A etapa 2 está disponível na árvore de trabalho para revisão.

Sugestão de mensagem: `Cria visual inicial do portfólio com fotos e animações`.

## Próxima entrega

Após a avaliação visual, etapa 3: galeria, filtros e detalhe com dados locais. O número do WhatsApp ainda precisa ser confirmado antes da inclusão do contato.
