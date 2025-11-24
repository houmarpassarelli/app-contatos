# UEX Contatos - Sistema de Gestão de Contatos

Este projeto é uma aplicação Fullstack para gerenciamento de contatos, desenvolvida como parte de um teste técnico. O sistema permite o cadastro, edição, visualização e exclusão de contatos, com funcionalidades de geolocalização e validação de dados.

## Documentação Adicional
Para detalhes mais técnicos e definições do projeto, consulte os seguintes documentos:
- [Definições do Projeto (DEFINITIONS.md)](DEFINITIONS.md)
- [Guia de Produção e Deploy (PRODUCTION.md)](PRODUCTION.md)

## Diferenciais e Decisões de Implementação

Considerando que as definições base para o teste já estavam estabelecidas no documento de requisitos, optei por focar em diferenciais técnicos e estruturais que agregam valor, robustez e escalabilidade ao projeto:

- **React 18:** Utilização da versão mais recente da biblioteca para uma interface reativa e performática.
- **Infraestrutura com Docker:** Configuração completa para execução tanto em ambiente local quanto em produção. Inclui um `docker-compose.pro.yml` específico para deploy em servidores dedicados.
- **Gerenciamento de Processos:** Uso do **Supervisor** para gerenciar simultaneamente o PHP-FPM e o Nginx dentro do container, garantindo resiliência.
- **Preparado para Redis:** O ambiente já está pré-configurado para uso do Redis, caso seja necessário escalar o cache ou filas no futuro.
- **Automação:** Criação de scripts utilitários para facilitar o dia a dia do desenvolvedor e o processo de build:
    - `run-tests.sh`
    - `build-prod.sh`
    - `setup-laravel.sh`
    - `start-dev.sh`
- **Apoio de IA:** Utilização de Inteligência Artificial para revisão de código, sugestão de melhorias, adição de comentários explicativos e elaboração da documentação técnica.

> *Nota sobre o Frontend:* Inicialmente, considerei a possibilidade de implementar duas versões de frontend (Vue.js e React.js). No entanto, em um projeto estruturado profissionalmente, manter duas versões concorrentes que entregam o mesmo resultado não é uma prática eficiente. Por isso, optei por focar na qualidade e estruturação sólida da versão em React.
