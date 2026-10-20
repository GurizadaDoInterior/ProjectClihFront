# Padrão de movimento e resposta — CLIH

## Feedback de interação

Os valores compartilhados estão em `src/theme/motion.ts`:

| Ação | Duração |
| --- | --- |
| Pressionar | 70 ms |
| Soltar / alterar cor ou estado | 160 ms |
| Trocar tela, mês ou acomodar gesto | 200 ms |
| Expandir conteúdo | 240 ms |
| Recolher / remover conteúdo | 180 ms |

Curva: `cubic-bezier(0.22,1,0.36,1)`. Pressão: escala 0,975.
A animação nunca adia a execução do clique. A preferência de movimento reduzido
remove deslocamentos e escalas; os estados e as ações continuam disponíveis.
Os movimentos decorativos do foguete e das estrelas usam ciclos próprios mais
longos e CSS no navegador, sem atualização de JavaScript a cada quadro.

## Componente compartilhado

`MotionPressable` compõe a escala de feedback com as transformações existentes.
Callbacks personalizados de pressão continuam recebendo os eventos e não
desativam o feedback. Botões sem papel explícito recebem papel de botão;
checkboxes, radios, switches, abas e links preservam seus papéis.
Seleções expõem `aria-checked`/`aria-selected`. A tecla Espaço ativa toggles
uma única vez; controles desabilitados e repetições da tecla não executam a ação.

## Conclusões de atividades

O bloqueio é por atividade, compartilhado entre os hooks do mesmo QueryClient.
O usuário pode clicar em outras atividades enquanto uma salva. A fila de
mutações mantém as gravações em ordem, mas aplica os estados visuais e o XP
otimista assim que cada mutação começa, inclusive se a requisição estiver na fila.

Uma falha desfaz somente a atividade e o XP daquela ação. Uma resposta anterior
não substitui o XP otimista de atividades posteriores. O histórico é atualizado
após o último salvamento. Cliques duplicados na mesma atividade são ignorados
até o término da respectiva mutação.

## Verificação de 20/10/2026

- `npm.cmd run check`: 62 testes aprovados, TypeScript sem erros e 16 rotas web exportadas.
- Um teste usa QueryClient/MutationObserver reais com requisições controladas para
  validar cliques rápidos, feedback dos itens enfileirados e gravação em ordem.
- Navegador local: navegação entre Hoje e Rotina; cliques em atividades;
  formulário de atividade; seleção de turnos; abertura e cancelamento do diálogo
  de exclusão; ativação de checkbox por Espaço. Nenhum erro no console capturado.
- Não foram realizados benchmark de FPS nem testes em aparelhos iOS/Android físicos.
- A captura de tela é da demonstração local. O código hospedado não foi alterado:
  a revisão automática rejeitou o envio de credenciais ao helper de sincronização
  do Sites por exigir uma aprovação desabilitada nesta sessão.

Branch local: `codex/fluid-interactions`.
