# API Football-Data.org - Instruções

## Sobre a API

O app FDMC agora usa a API [football-data.org](https://www.football-data.org/) para buscar dados dos jogos e classificação do Brasileirão. Esta API é gratuita para uso básico, mas requer registro para obter uma chave de API.

## Como obter uma chave de API

1. Acesse [https://www.football-data.org/client/register](https://www.football-data.org/client/register)
2. Faça o cadastro com seu email
3. Você receberá sua chave de API no email e também poderá vê-la na área de cliente após o login

## Configuração no App

1. Abra o arquivo `services/football-data.js`
2. Procure a linha `const API_KEY = "COLOQUE_SUA_API_KEY_AQUI";`
3. Substitua `COLOQUE_SUA_API_KEY_AQUI` pela sua chave de API recebida

## Limitações da API Gratuita

- Plano gratuito: 10 chamadas por minuto
- Os dados podem não estar atualizados em tempo real
- Algumas informações detalhadas podem não estar disponíveis
- Em caso de erro 429, significa que o limite de requisições foi atingido

## Suporte a Campeonatos

- Brasileirão Série A (ID: 2013)
- Premier League (ID: 2021)
- Champions League (ID: 2001)
- Copa do Mundo (ID: 2000)
- Euro (ID: 2018)

## Backup

Caso a API não retorne dados (por exemplo, devido a limitações da versão gratuita), o app usa dados de backup predefinidos para garantir que sempre haja conteúdo para visualizar.

## Alternando entre Tabelas

O app permite escolher entre:

- Tabela nativa (usando dados da football-data.org)
- SofaScore (usando WebView)

Para alternar, use o switch acima da tabela de classificação.
