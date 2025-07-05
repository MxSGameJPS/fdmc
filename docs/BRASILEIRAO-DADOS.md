# Instruções sobre os Dados do Brasileirão

## Situação Atual - ATUALIZAÇÃO (12/07/2025)

> **IMPORTANTE**: Conforme a solicitação mais recente, o aplicativo voltou a utilizar o **widget do SofaScore** para exibir a classificação do Brasileirão Betano em tempo real.

## Fonte dos Dados

Os dados são obtidos em tempo real diretamente do SofaScore através de um WebView integrado ao aplicativo. Isso garante que:

1. As informações estão sempre atualizadas
2. Não é necessário atualização manual dos dados
3. Temos acesso a dados confiáveis de uma fonte especializada

## Benefícios da Abordagem SofaScore

- **Dados em Tempo Real**: A classificação é sempre a mais atual disponível
- **Interface Profissional**: O widget do SofaScore oferece uma visualização limpa e profissional
- **Manutenção Simplificada**: Não há necessidade de atualizações manuais de dados
- **Informações Completas**: Todos os detalhes estatísticos são fornecidos pelo SofaScore

## Requisitos

- **Conexão à Internet**: Necessária para carregar os dados do SofaScore
- O aplicativo mantém um indicador de carregamento enquanto os dados são obtidos

## Componentes Utilizados

A tela do Brasileirão utiliza os seguintes componentes:

1. **WebView**: Para incorporar o widget do SofaScore
2. Suporta atualização via "pull-to-refresh" para recarregar os dados mais recentes

## Decisão de Design

A utilização do widget do SofaScore foi escolhida por:

1. Garantir uma experiência mais consistente ao usuário
2. Eliminar a necessidade de manutenção manual de dados
3. Focar na qualidade e atualidade das informações apresentadas

## Próximos Passos

1. Monitorar o desempenho do WebView em diferentes dispositivos
2. Avaliar a possibilidade de incluir outras estatísticas do Brasileirão via SofaScore
3. Considerar adicionar uma visualização offline fallback para casos de indisponibilidade
