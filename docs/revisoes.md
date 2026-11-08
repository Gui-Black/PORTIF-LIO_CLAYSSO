# Revisões, retirada e recuperação — etapa 7

## Ativar no Supabase local

Com os serviços iniciados, execute na pasta do projeto, antes de testar o painel:

```powershell
npm run supabase:migrate
```

Isso aplica `20261107000300_work_revisions.sql`, sem resetar o banco. A migração acrescenta a retirada reversível de fotos e operações de cópia e ordenação. O frontend desta etapa depende dela.

## Fluxo do fotógrafo

- **Editar uma cópia:** cria um rascunho com as informações e fotos da publicação atual. O endereço do trabalho permanece igual. O visitante continua vendo a publicação anterior; somente **Publicar trabalho** troca a seleção visível.
- **Mover antes / Mover depois:** salva imediatamente a ordem da foto dentro do rascunho. Não depende de arrastar com o mouse e funciona por teclado.
- **Retirar foto:** remove a foto da seleção, mantendo seu arquivo. Se for a capa, será necessário escolher outra. A publicação existente não é alterada por essa ação no rascunho.
- **Fotos retiradas → Restaurar foto:** retorna a foto ao rascunho. Confira a ordem e selecione a capa novamente, se necessário. Esta recuperação está disponível até publicar o rascunho.
- **Retirar da galeria:** oculta o trabalho nas próximas consultas públicas, preservando versões e arquivos. Links assinados já emitidos podem funcionar até expirar, por até uma hora; uma página já aberta pode precisar de atualização. Imagens também usadas em outra publicação ou no conteúdo institucional podem continuar públicas.
- **Preparar nova publicação:** quando não há publicação nem rascunho, cria uma cópia da última versão selada para revisar e publicar novamente. Se já existe rascunho, use **Continuar edição**.

Alterações de título e descrição precisam ser salvas antes das operações com fotos. O painel explica essas pendências. As ações de capa, ordem, retirada e restauração salvam imediatamente; não exigem clicar novamente em Salvar informações.

## Proteções e limites

As funções conferem a conta administrativa no servidor e bloqueiam versões publicadas. Ordem, retirada e restauração usam o número de revisão, evitando sobrescrever alterações feitas em outra aba. Uma lista de ordenação deve conter exatamente as fotos ativas do rascunho, sem IDs externos ou repetidos.

Criar a cópia é uma transação. Repetir a solicitação recupera a cópia existente; dois pedidos não criam dois rascunhos. As fotos da cópia recebem novos IDs, mas reutilizam os mesmos arquivos imutáveis do Storage. Isso evita duplicar os bytes de cada revisão. Não excluir um arquivo por pertencer a uma versão antiga: outras versões podem depender dele.

Retirar fotos é uma exclusão lógica (`removed_at`), sem apagar bytes. A leitura pública e a publicação ignoram fotos retiradas, e uma foto retirada não pode ser capa. Ao publicar, toda a versão é selada; uma nova cópia inclui apenas as fotos ativas. A interface não restaura fotos retiradas de uma versão já selada nem permite escolher qualquer versão histórica. Os registros permanecem no banco.

Não há limpeza automática de arquivos, exclusão definitiva de trabalhos ou rotina de backup nesta entrega. A retenção e a limpeza segura de arquivos continuam pendentes antes do lançamento.

## Teste real a executar

1. Em um trabalho publicado, clicar em **Editar uma cópia**. Conferir em janela anônima que a versão original continua aparecendo.
2. Trocar o título, salvar e mudar a ordem de duas fotos. Conferir que a galeria pública ainda usa o original.
3. Retirar a capa e conferir que o painel pede outra. Restaurar a foto em **Fotos retiradas** e escolher a capa.
4. Retirar uma foto diferente, publicar e atualizar a janela anônima. Conferir novo título, ordem e ausência da foto retirada.
5. Retirar o trabalho da galeria. Atualizar a janela anônima e conferir que o trabalho não aparece.
6. Clicar em **Preparar nova publicação**, revisar e publicar novamente.
7. Abrir um rascunho em duas abas. Alterar a ordem em uma e tentar editar com a revisão antiga na outra. Conferir o pedido de recarregamento.
8. Conferir teclado, celular, mensagens e confirmações antes de usar com conteúdo definitivo.

Os testes automatizados usam PGlite e contratos simulados; não equivalem a testes de concorrência HTTP real ou verificação visual. A migração e este roteiro precisam ser executados no ambiente do usuário, pois a sessão automatizada não tem acesso ao Docker.
