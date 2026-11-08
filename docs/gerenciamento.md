# Cadastro, publicação e revisões — etapas 6 e 7

O painel permite criar um trabalho, editar seu rascunho, enviar fotografias, escolher a capa e publicar a seleção na galeria. O desenvolvimento continua local: publicar um trabalho no banco local não faz deploy do site.

## Ativar e testar

Com o Docker e o Supabase local iniciados, executar na pasta do projeto:

```powershell
npm run supabase:migrate
npm run dev -- --port 5173 --strictPort
```

O primeiro comando aplica migrações pendentes sem resetar o banco. A configuração de `.env.local` e a concessão de acesso administrativo seguem o [guia de autenticação](autenticacao.md). Não usar chave secreta ou `service_role` no frontend.

1. Abrir `http://localhost:5173/?acesso=painel` e entrar com a conta administrativa de teste.
2. Criar um trabalho com título, endereço único (slug) e categoria.
3. Editar a descrição e salvar as informações antes de enviar fotografias.
4. Enviar uma foto de teste com descrição acessível. São aceitos JPEG, PNG e WebP de até 10 MiB, dimensões até 20.000 pixels por lado e até 40 milhões de pixels no navegador.
5. Clicar em **Usar como capa** na miniatura desejada; essa ação salva a capa. Conferir a lista de pendências da etapa 3 antes de publicar.
6. Abrir a página pública em janela anônima antes da publicação: o rascunho não deve aparecer.
7. Publicar o trabalho e atualizar a página pública. Conferir capa, categoria, página do trabalho e visualizador.
8. Em duas abas administrativas, abrir o mesmo rascunho e salvar alterações diferentes. Uma gravação com revisão antiga deve ser recusada, solicitando recarregamento.
9. Testar falha de conexão durante o envio e a retomada da tentativa, além de teclado e telas pequenas.

Usar imagens autorizadas para teste e dados fictícios. Registrar os resultados reais em `docs/andamento.md`.

## Como funciona

### Organização do painel

A lista separa o estado dos trabalhos e mantém o formulário de criação recolhido em **Criar novo trabalho**. O endereço é sugerido a partir do título e continua editável antes da criação. O editor apresenta três etapas numeradas, capa escolhida pela miniatura, confirmação do que foi salvo e uma lista das condições para publicar. Recarregar dados fica em uma opção secundária. Mensagens explicam por que uma ação está indisponível.

Referências de interface consultadas:

- [NN/g: progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — apresentar opções secundárias sob demanda.
- [GOV.UK: task list](https://design-system.service.gov.uk/components/task-list/) — identificar tarefas e seus estados.
- [DWP: diferença entre upload e envio final](https://design-system.dwp.gov.uk/contribute/file-upload/upload-submit) — distinguir adicionar arquivos de concluir a publicação.

As referências orientam a adaptação; o layout mantém as cores e a identidade do portfólio. A revisão automatizada não substitui o teste visual em navegador e celular.

Um trabalho tem um endereço estável e uma versão em rascunho. Salvar aumenta sua revisão; essa revisão impede que uma aba sobrescreva silenciosamente alterações feitas em outra. Publicar valida as fotos e a capa, fecha a versão e aponta o trabalho para ela em uma transação.

A galeria consulta o Supabase com um cliente anônimo separado, inclusive quando o administrador está conectado. Com as variáveis configuradas, mostra somente trabalhos publicados; uma galeria vazia não é substituída por exemplos. Sem configuração, permanece a demonstração estática. As imagens institucionais da página inicial continuam locais.

O bucket permanece privado. As fotos visíveis usam URLs assinadas com validade de uma hora; a galeria renova a consulta a cada 45 minutos e ao recuperar o foco. Uma URL já emitida pode continuar funcionando até expirar mesmo após retirar uma publicação.

## Envios e recuperação de falhas

O envio mostra fases, sem simular porcentagens. O arquivo não é sobrescrito. Se o Storage recebeu a foto, mas a associação no banco falhou, a retomada compara o conteúdo por SHA-256 e reutiliza os mesmos identificadores. Mantenha a página aberta para preservar essa tentativa; recarregar o rascunho pelo botão do painel preserva a tentativa em memória.

Fechar a página ou descartar uma tentativa pode deixar um arquivo sem associação no Storage. A limpeza desses arquivos fica para uma próxima etapa; não há exclusão automática. Em caso de resultado incerto, recarregar o rascunho e conferir o estado antes de repetir a operação.

O navegador verifica formato e dimensões. O banco verifica autorização, revisão, caminho e metadados do objeto no Storage. Isso não equivale a decodificação ou inspeção completa do arquivo no servidor; o upload é reservado ao administrador autorizado.

## Limites e verificações

O painel oferece reordenação, retirada e restauração de fotos do rascunho, retirada de publicação e criação de uma cópia para editar um trabalho publicado. Uma versão publicada não é editada diretamente. Exclusão definitiva de trabalhos, limpeza de arquivos órfãos e restauração de um histórico arbitrário ainda não têm interface.

O site continua como protótipo local, sem deploy e com indexação desativada. Metadados para prévias em redes sociais ainda precisam de tratamento antes de uma publicação oficial.

`npm run check` executa lint, formatação, testes, TypeScript e build. Os testes de banco usam PGlite; os testes de upload usam respostas simuladas. Eles cobrem permissões, revisão, repetição de operações, publicação e paginação, mas não comprovam upload HTTP real nem interação no navegador. O roteiro acima permanece pendente no Supabase local do usuário, pois o Docker nega acesso à sessão automatizada.
