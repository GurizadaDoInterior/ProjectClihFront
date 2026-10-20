# Calendário de tarefas e agenda — 20/10/2026

## Criação de atividades

O calendário substitui a seleção de dias da semana. O usuário escolhe uma data,
incluindo meses futuros, e uma opção de repetição:

- **Não repetir**: a atividade existe somente na data escolhida.
- **Todos os dias**: começa na data escolhida e repete diariamente.
- **Toda semana**: começa na data escolhida e repete no mesmo dia da semana.

A opção inicial é Não repetir. As datas anteriores a hoje ficam desabilitadas
na criação. Os turnos continuam independentes, como antes.

## Rotina

O botão Ver minha agenda expande o calendário usando o padrão de animação
existente. Cada data mostra a quantidade de ocorrências programadas, incluindo
os turnos separados. Abaixo aparecem as atividades da data selecionada.

Datas futuras são apenas consultadas nessa lista, sem conclusão antecipada.
O botão Agendar para este dia abre a criação com a data já preenchida.
A lista normal da Rotina continua identificada como Atividades de hoje.

## Compatibilidade com a API

Nenhuma migração ou alteração no backend foi necessária. A criação envia
`startDate`, `endDate` e `scheduledDays`, já aceitos pelo backend:

- Tarefa única: início e fim iguais à data escolhida, com seu dia da semana.
- Diária: início na data escolhida, sete dias da semana, sem fim.
- Semanal: início na data escolhida, seu dia da semana, sem fim.

A agenda consulta `/habits` para calcular os totais do mês e
`/today?date=AAAA-MM-DD` para os detalhes de cada dia. O cálculo mensal fica
limitado aos dias do mês e não dispara uma requisição por dia.
O comportamento dos hábitos já cadastrados permanece igual.

## Verificação

`npm.cmd run check` passou: 69 testes, TypeScript sem erros e 16 rotas exportadas.
Os testes cobrem datas inválidas, ano bissexto, virada do ano, repetição diária e
semanal, tarefa única, contagem de turnos, parâmetros da API e pré-seleção de data.

No navegador local, com dados de demonstração, foi criada uma atividade para
5 de novembro de 2026 a partir da agenda. Ela apareceu nesse dia, não apareceu
na rotina de hoje e não se repetiu em 12 de novembro. O console não mostrou erros.
O modo demonstração mantém seus dados apenas durante a sessão, como antes;
quando conectado à API, o agendamento é salvo pelo backend.

O backend conectado e aparelhos iOS/Android físicos não foram executados nesta
verificação. O site publicado não foi atualizado: a sincronização do Sites
continua bloqueada pela revisão automática, que exige uma aprovação desabilitada
nesta sessão. As alterações estão na cópia local do frontend, preservando as
melhorias de animação e resposta do trabalho anterior.
