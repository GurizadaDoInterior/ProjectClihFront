# Clih — aplicativo multiplataforma

Base do produto de rotina e evolução pessoal da Gurizada do Interior. O mesmo projeto Expo entrega Android, iOS e web; a experiência é desenhada primeiro para celular.

## O que já existe

- Navegação principal: Hoje, Rotina, Evolução, Conquistas e Perfil.
- Resumo do dia com nível, sequência, semana, progresso e equilíbrio por área.
- Conclusão otimista de atividades com feedback tátil.
- Fila local idempotente quando a API está indisponível.
- Registro de sono e criação de atividade com validação.
- Dados de demonstração quando `EXPO_PUBLIC_API_URL` não está configurada.
- Referência visual e quatro direções de ícone em `docs/design`.

## Rodar localmente

Requisitos: Node.js 22.13 ou superior e o app Expo Go para testar no celular.

```bash
npm install
copy .env.example .env
npm start
```

No terminal do Expo, use `a` para Android, `w` para web ou leia o QR code com o Expo Go. O build nativo de iOS exige macOS, mas o desenvolvimento pode ser acompanhado no Expo Go.

## Comandos

```bash
npm run typecheck
npm run build:web
npm run check
```

## Estrutura

```text
app/                  rotas e telas do Expo Router
src/components/       componentes visuais reutilizáveis
src/features/         regras e estado por funcionalidade
src/services/api/     comunicação com a API Java
src/services/storage/ cache e fila offline
src/theme/            cores, espaçamentos e raios
docs/                 decisões e referências visuais
```

## Próximas decisões da equipe

1. Escolher nome final e uma das quatro direções de ícone.
2. Escolher provedor OAuth/OpenID para Google, Apple e e-mail.
3. Definir se perfil usa foto, personagem ou ambos.
4. Validar o ciclo principal com usuários antes de ampliar a camada social.
