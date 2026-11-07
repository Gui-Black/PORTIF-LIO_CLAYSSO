# Andamento do projeto

## Estado atual

Etapas 1 a 3 commitadas pelo usuário. Fundação da etapa 4 implementada e validada localmente em 7 de novembro de 2026. O repositório estava limpo e sincronizado com `origin/main` no início da etapa 4. A integração completa com os serviços Supabase ainda está pendente.

A publicação contínua na Vercel foi adiada pelo usuário. O desenvolvimento segue local, sem provisionamento remoto ou deploy.

## Etapa 4

- [x] Criar as seis tabelas, com administradores em schema privado.
- [x] Definir relações, capa por versão, ordem das fotos e um rascunho por trabalho.
- [x] Aplicar RLS e permissões de tabela, coluna e função.
- [x] Implementar publicação/retirada transacionais com controle de revisão.
- [x] Proteger versões seladas contra alterações.
- [x] Preparar bucket privado e políticas de Storage, bloqueando sobrescrita e exclusão pela aplicação.
- [x] Preparar seed fictício sem contas, credenciais ou fotos reais.
- [x] Executar 16 testes de banco e os oito testes anteriores.
- [x] Validar lint, formatação, tipos e build.
- [ ] Validar config, migrações, Auth e Storage no Supabase local completo.
- [ ] Testar concorrência em conexões independentes e URLs assinadas reais.
- [ ] Revisar e commitar a etapa 4 pelo usuário.

`npm run check` passou com 24 testes. O PGlite 0.5.15 executou PostgreSQL 18.6 em memória; o contrato mínimo de Auth/Storage simula somente identidade e metadados. Isso valida as regras SQL e RLS, mas não substitui os serviços completos. O ambiente Supabase proposto usa PostgreSQL 17 e também precisará dessa conferência. Não foram encontrados Docker, CLI Supabase ou `psql` no terminal.

A dependência adicionada é exclusiva dos testes. O frontend não foi conectado ao banco e o build da aplicação mantém os mesmos arquivos JS/CSS da etapa anterior. Ver [Banco e permissões](banco.md) para o modelo, a matriz de acesso, a execução e as limitações.

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
- [x] Revisar e commitar a entrega pelo usuário.

## Verificações da etapa 3

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

Os commits continuam sob responsabilidade do usuário. Sugestão de mensagem para a etapa 4: `Adiciona estrutura do banco e regras de acesso`.

## Próxima entrega

Preparar o Supabase local completo e validar esta fundação pelos serviços reais antes de integrar login, sessão e recuperação da etapa 5. Antes da integração definitiva das páginas públicas, resolver renderização, metadados sociais e acesso às imagens. A conferência visual da galeria continua pendente.
