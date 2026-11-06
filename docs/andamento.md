# Andamento do projeto

## Estado atual

Etapas 1 e 2 commitadas pelo usuário. Etapa 3 autorizada na continuidade e implementada com dados locais, aguardando conferência visual e revisão do usuário. O repositório estava limpo e sincronizado com `origin/main` no início desta etapa.

## Etapa 3

- [x] Criar dados tipados para duas seleções e seis fotografias.
- [x] Implementar filtros das cinco categorias planejadas e estado vazio.
- [x] Implementar detalhe com endereço próprio e trabalho não encontrado.
- [x] Implementar fotos ampliadas, controles, atalhos e gesto lateral.
- [x] Preservar filtro, rolagem e alvo de foco no retorno à galeria.
- [x] Tratar falha de imagem e manter navegação nativa para cliques modificados.
- [x] Acrescentar oito testes automatizados sem dependências novas.
- [x] Validar lint, formatação, testes, tipos e build.
- [x] Conferir resposta HTTP da página, endereços de detalhe e seis imagens.
- [ ] Conferir navegação, foco, gesto e layout em navegador real.
- [ ] Validar nomes e agrupamentos provisórios com Claysso.
- [ ] Revisar e commitar a entrega pelo usuário.

## Verificações

| Verificação              | Resultado                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- |
| `npm run check`          | ESLint, Prettier, oito testes, TypeScript e build aprovados                     |
| HTTP local               | Página, entradas por consulta e seis imagens retornaram 200                     |
| Dados e navegação        | Testes de filtros, fotos, links, índices, gestos e histórico simulado aprovados |
| Conferência em navegador | Pendente; prévia integrada retornou erro e navegador integrado indisponível     |

O HTTP 200 de um endereço inválido é a resposta do servidor estático ao documento da aplicação. A tela de trabalho não encontrado é decidida pelo cliente. Não há status HTTP 404 específico nesta etapa.

Os testes de histórico simulam a API e não comprovam layout, foco, gesto físico ou acessibilidade em um navegador real. O roteiro completo está em [Galeria e validação](galeria.md). Para conferir, executar `npm run dev` e abrir o endereço indicado no terminal.

O aviso de `http-proxy` continua vindo do ambiente hospedeiro, sem impedir as verificações. Não foram adicionadas dependências.

## Versionamento

Os commits continuam sob responsabilidade do usuário. Sugestão de mensagem para a etapa 3: `Adiciona galeria com filtros e visualização das fotos`.

## Próxima entrega

Etapa 4: modelar banco, restrições e permissões no Supabase. Antes de integrar definitivamente as páginas públicas, resolver renderização, metadados sociais e acesso às imagens. A conferência visual pendente deve acompanhar a revisão desta entrega.
