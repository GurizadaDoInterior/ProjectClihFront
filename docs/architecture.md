# Arquitetura do frontend

## Por que React Native + Expo

Java permanece no backend. No cliente, React Native e Expo permitem manter uma interface única para iOS, Android e web, sem abrir três bases independentes. O Expo Router organiza as telas por arquivos e o build web usa a mesma árvore de componentes.

## Divisão de estado

- **Servidor:** rotina, áreas, conclusões, XP e perfil ficam no TanStack Query.
- **Interface:** modais, seleção e animação permanecem em estado local.
- **Conclusões:** a interface antecipa a marcação e reverte em caso de erro. Falhas temporárias são repetidas uma vez com a mesma chave idempotente. XP, nível e sequência são sempre recarregados do servidor. Não há sincronização offline persistente nesta versão; a fila antiga não tinha consumidor e ocultava erros de validação.

## Integração

Sem `EXPO_PUBLIC_API_URL`, o aplicativo usa dados de demonstração. Com a variável configurada, `GET /api/v1/today` carrega o resumo e `POST /api/v1/habits/{id}/completions` registra conclusões.

O adaptador `today-mapper.ts` traduz os DTOs Java para as telas. As áreas preservam nome, cor e ID definidos pelo usuário. A barra de nível usa XP relativo aos limites do nível atual. Consulte `backend-integration.md` para configuração, endpoints e limitações.

## Design

O arquivo `design/home-concept.png` é a referência da tela inicial. `design/icon-options.png` contém quatro direções; nenhuma é definitiva até a equipe escolher.
