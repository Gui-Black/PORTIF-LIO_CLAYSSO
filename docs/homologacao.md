# Homologação local — etapa 9

O objetivo é confirmar que Claysso consegue administrar uma seleção sozinho e que o visitante consegue explorar as fotos e iniciar contato. Esta etapa não autoriza nem realiza lançamento, deploy ou alteração de infraestrutura remota.

## Preparar

Na pasta do projeto, com Docker e Supabase local iniciados, execute cada comando e prossiga somente se terminar sem erro:

```powershell
npm run supabase:migrate
npm run check
npm run dev -- --port 5173 --strictPort
```

Se o Vite já estiver aberto na porta 5173, use esse processo. Não inicie outro na mesma porta. Use o mesmo endereço `localhost` durante o teste de login e recuperação de senha. A configuração e as contas de teste estão em [Autenticação](autenticacao.md).

Use uma seleção chamada **Homologação — teste**, contas fictícias e fotos autorizadas. Não altere um trabalho importante para testar retirada ou restauração.

`supabase:verify` é uma checagem inicial somente de leitura, dependente do seed original. Se você já publicou o trabalho demonstrativo, essa checagem pode falhar por essa mudança. Não resetar o banco para fazê-la passar; ela não substitui os testes abaixo.

## Roteiro de aceite

| ID  | Ação                                                                                                              | Resultado esperado                                                       | Resultado real |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------- |
| V01 | Abrir a página, rolar pelas seis cenas e clicar em A experiência                                                  | Conteúdo legível, destino correto e sem rolagem horizontal               | Pendente       |
| V02 | Filtrar uma categoria, abrir uma seleção, trocar fotos e voltar                                                   | Fotos corretas, filtro e navegação preservados                           | Pendente       |
| V03 | Usar Tab, Enter e Escape; repetir em 320, 375, 768 e 1440 px                                                      | Foco visível, menu e visualizador utilizáveis, sem controles cortados    | Pendente       |
| V04 | Ativar movimento reduzido no sistema e visitar a página                                                           | Conteúdo visível sem animações de entrada ou transição por rolagem       | Pendente       |
| V05 | Abrir contato e conferir o destino do Instagram                                                                   | Perfil correto; nenhum envio automático de mensagem                      | Pendente       |
| A01 | Entrar como administrador, recarregar, sair e tentar voltar ao painel                                             | Sessão recuperada quando válida; acesso encerrado após saída             | Pendente       |
| A02 | Entrar com a conta comum de teste                                                                                 | Administração negada, sem acesso aos rascunhos                           | Pendente       |
| A03 | Criar seleção, salvar título e enviar duas fotos                                                                  | Fotos e metadados persistem ao recarregar                                | Pendente       |
| A04 | Escolher capa e conferir em janela anônima antes de publicar                                                      | Capa salva; rascunho ainda invisível ao visitante                        | Pendente       |
| A05 | Publicar e abrir em janela anônima                                                                                | Título, capa e fotos aparecem na galeria                                 | Pendente       |
| A06 | Editar uma cópia, mudar título e ordem sem publicar                                                               | Visitante continua vendo a versão anterior                               | Pendente       |
| A07 | Retirar a capa, restaurar a foto e escolher capa novamente                                                        | Retirada pede nova capa; restauração preserva a foto                     | Pendente       |
| A08 | Publicar a cópia                                                                                                  | Nova seleção substitui a anterior no mesmo endereço                      | Pendente       |
| A09 | Retirar trabalho da galeria, preparar nova publicação e publicar                                                  | Trabalho sai e volta à galeria; arquivos preservados                     | Pendente       |
| A10 | Abrir o mesmo rascunho em duas abas e salvar alterações diferentes                                                | A revisão antiga é recusada, sem sobrescrever a alteração mais recente   | Pendente       |
| A11 | Solicitar recuperação, abrir Mailpit e trocar a senha                                                             | Apenas link válido permite trocar senha; nova senha funciona             | Pendente       |
| F01 | Usar arquivo inválido, grande demais ou foto sem descrição                                                        | Mensagem compreensível; nenhum envio indevido                            | Pendente       |
| F02 | Simular rede offline no navegador durante o upload e depois restabelecer                                          | Erro visível; retomada não duplica a fotografia                          | Pendente       |
| F03 | Com frontend carregado, bloquear requisições ao Supabase nas ferramentas do navegador e tentar carregar a galeria | Erro limitado à galeria; apresentação e contato permanecem acessíveis    | Pendente       |
| F04 | Desbloquear o Supabase e clicar em Tentar carregar as fotos                                                       | Estado de carregamento seguido da galeria real, sem exemplos substitutos | Pendente       |

Ao terminar o teste, retirar a seleção **Homologação — teste** da galeria. Não apagar volumes Docker, arquivos de fotos ou registros de histórico.

## Como registrar um problema

Anote o ID do teste, navegador/largura, ação realizada, resultado esperado e mensagem exibida. Se enviar captura, esconda dados de conta. Nunca envie senhas, tokens, chaves ou a saída completa de `supabase:status`.

Os resultados podem ser preenchidos nesta tabela com data e responsável. “Pendente” só deve virar “Aprovado” após executar o teste, não por uma passagem de etapa no desenvolvimento.

## Evidência automatizada e seus limites

`npm run check` cobre lint, formatação, testes, TypeScript e build. Os testes SQL usam PGlite com contrato simulado de Auth/Storage; os testes de renderização geram HTML dos componentes React sem navegador. Eles verificam que erro, carregamento e vazio não se confundem e que contato e apresentação permanecem disponíveis.

Isso não comprova envio HTTP real, login completo, layout, animações, concorrência com conexões independentes ou funcionamento de backup. A captura automática no navegador não esteve disponível nas etapas anteriores. A sessão automatizada também não acessa o Docker do usuário.

## Recuperação durante os testes

- Erro de migração: interromper o teste e registrar a mensagem; não usar reset como correção.
- Envio pendente: manter a página aberta e tentar retomar. O erro informa se falta a migração ou se houve falha de conexão/associação.
- Revisão desatualizada: usar Recarregar rascunho, conferir as informações e refazer apenas a alteração desejada.
- Foto retirada: restaurar no próprio rascunho antes de publicar. Depois de selada a versão, essa recuperação não está disponível na interface.
- Trabalho retirado: usar Preparar nova publicação ou continuar o rascunho existente.
- Regressão de código: preservar o estado atual e revisar o commit a reverter. Reverter código não reverte migrações nem restaura dados; o frontend escolhido precisa ser compatível com o banco atual.

Ainda não existe backup automatizado testado. Antes de mover para hospedagem real, será necessário copiar e testar a restauração de banco, arquivos do Storage e configuração de acesso em ambiente isolado. Um commit Git ou a pasta `dist` não faz backup desses dados.

## Condições antes de lançar

Não considerar o protótipo aprovado enquanto os fluxos essenciais estiverem pendentes. O lançamento também depende de aprovação visual/editorial, autorização das fotografias, contato definitivo, otimização e metadados das imagens, renderização para compartilhamento/busca, ambiente de dados apropriado, recuperação testada e configuração de e-mail. O site permanece com `noindex, nofollow` e a integração Vercel/GitHub continua adiada.
