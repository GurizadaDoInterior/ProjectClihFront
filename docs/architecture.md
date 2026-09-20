# Arquitetura do frontend

## Por que React Native + Expo

Java permanece no backend. No cliente, React Native e Expo permitem manter uma interface única para iOS, Android e web, sem abrir três bases independentes. O Expo Router organiza as telas por arquivos e o build web usa a mesma árvore de componentes.

## Divisão de estado

- **Servidor:** rotina, conclusões, pontos, conquistas e perfil ficam no TanStack Query.
- **Interface:** modais, seleção e animação permanecem em estado local.
- **Offline:** ações ainda não confirmadas são persistidas no AsyncStorage com uma chave idempotente. O backend continua sendo a fonte oficial de pontos.

## Integração

Sem `EXPO_PUBLIC_API_URL`, o aplicativo usa dados de demonstração. Com a variável configurada, `GET /api/v1/today` carrega o resumo e `POST /api/v1/habits/{id}/completions` registra conclusões.

## Design

O arquivo `design/home-concept.png` é a referência da tela inicial. `design/icon-options.png` contém quatro direções; nenhuma é definitiva até a equipe escolher.
