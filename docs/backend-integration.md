# Integração com o backend

Contrato conferido com `GurizadaDoInterior/ProjectClihBackEnd`, commit `4b3ba317e77ee8d57f7920cdc84514bb08228ac9`.

## Executar

1. No backend, com Java 21 e Docker Desktop instalados, execute `docker compose up -d`, defina `SPRING_PROFILES_ACTIVE=local` e execute `mvnw.cmd spring-boot:run`.
2. No front, execute `npm ci` e copie `.env.example` para `.env`.
3. Para web, use `EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1` e execute `npm run web`. O backend local permite a origem `http://localhost:8081`.
4. Para Android Emulator, use `http://10.0.2.2:8080/api/v1`. Para celular físico, use o IP do computador na mesma rede, por exemplo `http://192.168.1.10:8080/api/v1`, com a porta 8080 acessível pelo aparelho. Reinicie o Expo após mudar `.env`.
5. Sem URL configurada, o app mostra dados de demonstração. Criar e concluir atividades nesse modo altera apenas a demonstração em memória.

A URL pode incluir ou omitir `/api/v1`; o cliente normaliza o prefixo sem duplicá-lo.

## Fluxos conectados

- Hoje: `GET /today`, incluindo hábitos, semana, XP, nível, sequência e áreas personalizadas.
- Rotina: atividades de hoje agrupadas por `MORNING`, `AFTERNOON`, `EVENING` e `ANYTIME`.
- Nova atividade: `GET /areas`, `POST /areas` e `POST /habits`. Área existente ou nova, quantidade positiva, unidade e dias da semana obrigatórios.
- Conclusão: `POST /habits/{id}/completions`, com `completedAt` e `Idempotency-Key`. Não envia XP. Repetições por falha temporária mantêm a mesma chave e o mesmo instante; após a resposta, recarrega o resumo oficial.
- Evolução: recorte semanal e progresso do dia por área fornecidos por `/today`.
- Perfil: `GET /me` e progresso real de `/today`.

## Limites atuais

- A API não oferece desfazer conclusão; atividades concluídas ficam desabilitadas.
- Falhas de rede não são confirmações de salvamento. Há uma repetição automática imediata; se falhar, a interface mostra erro e recarrega o estado. A antiga fila local sem consumidor foi retirada. Uma fila durável futura deve ser isolada por usuário/servidor e respeitar a janela de 14 dias da API.
- O modo local do backend usa uma identidade fixa. Cadastro/login OIDC ainda depende da escolha do provedor. `setAccessTokenProvider` permite fornecer tokens em memória quando esse fluxo for implementado. Não coloque tokens em `.env`, `EXPO_PUBLIC_*` ou no Git.
- Sono permanece somente no aparelho. Conquistas, loja, diário e recursos sociais não têm endpoints nesta versão. Nenhum prêmio fictício é mostrado no modo conectado.
- Edição/arquivamento de hábitos e áreas e edição de perfil são endpoints disponíveis, mas ainda não têm telas neste protótipo.
- O cache do TanStack Query é em memória; não há garantia de funcionamento após reiniciar o aplicativo sem rede.

## Validação

`npm test` testa os DTOs, áreas personalizadas, XP relativo ao nível, URL, token, criação, idempotência, falhas de rede, validação e autenticação com respostas HTTP controladas. `npm run check` também verifica TypeScript e exporta a versão web.

Esses testes não substituem uma execução contra Java/PostgreSQL. Na máquina usada nesta integração não havia Java nem Docker, e a equipe não tinha uma API hospedada. O teste ponta a ponta real continua pendente.

Também foi validada a interface web no Edge, em tamanho de celular, com respostas controladas: criação de área e hábito, campos enviados, conclusão, XP atualizado, bloqueio de segunda conclusão, rotina, perfil, conquistas indisponíveis e recuperação após erro. Não ocorreram exceções no navegador. Não houve execução em aparelho Android/iOS.

### Roteiro contra a API real

1. Abra o front conectado e confira o usuário local em Perfil.
2. Em Rotina → +, crie uma área personalizada e um hábito agendado para o dia atual.
3. Confira nome, quantidade, unidade, área e período em Hoje/Rotina; recarregue para confirmar persistência.
4. Conclua a atividade e confira XP/nível/semana atualizados. Ela não deve permitir uma segunda conclusão.
5. Recarregue o navegador e confira a conclusão persistida no banco.
6. Desligue a API e tente criar/concluir: deve aparecer um erro, sem confirmação falsa. Religue a API e tente novamente.
7. Confira que hábitos sem agendamento para hoje não aparecem na rotina do dia e que áreas personalizadas aparecem em Evolução.
