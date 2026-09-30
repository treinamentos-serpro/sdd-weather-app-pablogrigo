# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para permitir que
usuários consultem as condições meteorológicas de cidades de seu interesse.
O produto deve atender a um fluxo simples e recorrente: localizar uma cidade,
visualizar o clima atual e consultar a previsão dos próximos cinco dias.

O público-alvo não foi detalhado, portanto o primeiro recorte deve priorizar
clareza, rapidez de consulta e uso em dispositivos móveis. A aplicação deve
também permitir a escolha da unidade de temperatura, oferecendo Celsius e
Fahrenheit.

O escopo inicial identificado é um MVP de consulta, sem indicação de recursos
como contas de usuário, favoritos, alertas ou edição manual de dados.

## Requisitos Funcionais

### RF01 — Buscar cidades

- O usuário deve poder informar o nome de uma cidade em um campo de busca.
- O sistema deve apresentar resultados compatíveis para que o usuário selecione
  a cidade desejada.
- Quando houver cidades com nomes iguais, os resultados devem exibir contexto
  suficiente para diferenciá-las, como estado, região ou país.
- O sistema deve tratar buscas sem resultado e entradas inválidas com uma
  mensagem compreensível.

### RF02 — Exibir clima atual

- Após a seleção de uma cidade, o sistema deve exibir as condições atuais.
- A informação deve incluir, no mínimo, temperatura e uma descrição ou ícone da
  condição meteorológica.
- A cidade selecionada deve permanecer identificada na tela para evitar
  ambiguidade.
- O sistema deve informar quando os dados exibidos foram atualizados, caso essa
  informação esteja disponível na fonte de dados.

### RF03 — Exibir previsão de cinco dias

- O sistema deve exibir a previsão diária do dia atual e dos quatro dias
  seguintes, totalizando cinco dias.
- Cada dia deve apresentar, no mínimo, data, condição meteorológica e
  temperaturas relevantes, como máxima e mínima.
- A previsão deve estar associada visualmente à cidade selecionada.

### RF04 — Alternar unidade de temperatura

- O usuário deve poder alternar entre Celsius (°C) e Fahrenheit (°F).
- A unidade selecionada deve ser aplicada ao clima atual e à previsão de cinco
  dias.
- A alternância deve atualizar a apresentação sem exigir nova busca da cidade.
- Os valores exibidos devem ser convertidos corretamente e identificados com a
  unidade correspondente.

### RF05 — Estados da interação

- O sistema deve indicar carregamento enquanto busca cidades ou dados de clima.
- O sistema deve apresentar uma mensagem orientativa quando ainda não houver
  cidade selecionada.
- O sistema deve apresentar uma mensagem acionável quando a fonte de dados
  estiver indisponível ou retornar erro.
- O usuário deve poder realizar uma nova busca após uma consulta concluída ou
  após um erro.

## Requisitos Não-Funcionais

### RNF01 — Responsividade

- A aplicação deve ser utilizável em dispositivos móveis e em telas maiores.
- Conteúdo, controles e resultados devem se adaptar sem exigir rolagem
  horizontal.
- Os principais controles devem ser confortáveis para interação por toque.

### RNF02 — Usabilidade e acessibilidade

- Os textos, unidades e estados do sistema devem ser claros para usuários não
  técnicos.
- Campos, controles e resultados devem possuir rótulos semânticos e ser
  operáveis por teclado.
- O contraste visual deve permitir a leitura das informações meteorológicas.
- Mensagens de carregamento e erro devem ser perceptíveis por tecnologias
  assistivas.

### RNF03 — Desempenho

- A interface deve responder rapidamente às ações locais, como alternar a
  unidade de temperatura.
- A aplicação deve evitar requisições redundantes ao alternar entre Celsius e
  Fahrenheit.
- O carregamento inicial e as consultas devem exibir feedback imediato ao
  usuário.

### RNF04 — Confiabilidade e resiliência

- Falhas de rede, respostas incompletas e ausência de resultados devem ser
  tratados sem quebrar a interface.
- A aplicação não deve exibir dados de uma cidade diferente da selecionada.
- A origem e o momento dos dados devem ser considerados na apresentação e na
  interpretação da previsão.

### RNF05 — Compatibilidade e manutenção

- A aplicação deve funcionar nos navegadores modernos com suporte aos
  dispositivos móveis previstos para o produto.
- A integração com o provedor de dados deve ficar isolada da camada de
  apresentação para facilitar manutenção e eventual troca de provedor.

## Decisões

### D01 — Fonte de dados: Open-Meteo

- **Decisão:** utilizar a Open-Meteo como fonte de geocodificação e previsão
  meteorológica.
- **Justificativa:** a fonte atende ao escopo inicial sem exigir uma chave de
  API, reduzindo a barreira de configuração e o risco de exposição de
  credenciais no MVP.
- **Perguntas resolvidas:** qual provedor será utilizado e se haverá
  necessidade de autenticação para a integração.
- **Ponto a validar:** cobertura, limites de uso, disponibilidade e licença
  devem ser confirmados antes da publicação.

### D02 — Definição de cinco dias

- **Decisão:** a previsão será composta pelo dia atual mais os quatro dias
  seguintes.
- **Justificativa:** oferece uma janela de planejamento de cinco dias sem
  deixar o dia atual fora da consulta principal.
- **Perguntas resolvidas:** se “cinco dias” inclui o dia atual e qual será o
  intervalo temporal exibido.

### D03 — Unidade padrão: Celsius

- **Decisão:** Celsius (°C) será a unidade exibida inicialmente.
- **Justificativa:** estabelece um comportamento padrão consistente para a
  primeira visita, mantendo Fahrenheit como alternativa disponível.
- **Perguntas resolvidas:** qual unidade deve ser usada como padrão.
- **Ponto a validar:** a persistência da preferência entre sessões permanece
  fora desta decisão e deve ser definida separadamente.

### D04 — Sem autenticação e sem persistência de servidor

- **Decisão:** o MVP não terá contas de usuário nem armazenamento de dados em
  servidor.
- **Justificativa:** mantém o produto focado em consultas meteorológicas e
  reduz complexidade de segurança, infraestrutura e privacidade.
- **Perguntas resolvidas:** se autenticação, perfis ou persistência de servidor
  fazem parte do escopo inicial.
- **Ponto a validar:** ainda é necessário decidir se preferências ou última
  cidade poderão ser armazenadas localmente no dispositivo.

### D05 — Idioma da interface: pt-BR

- **Decisão:** todos os textos da interface serão apresentados em português do
  Brasil.
- **Justificativa:** define uma experiência consistente para o público inicial
  e evita que textos, mensagens e formatos regionais sejam implementados de
  forma ambígua.
- **Perguntas resolvidas:** qual idioma será usado no MVP e qual convenção
  linguística deve orientar textos e mensagens.
- **Ponto a validar:** formatos locais de data, hora e nomes de localidades
  ainda devem ser confirmados junto ao requisito de fuso horário.

## Pendências Prioritárias para a Especificação

As decisões abaixo ainda não foram fechadas e devem ser resolvidas antes do
plano técnico, pois influenciam contratos de dados, componentes e testes:

- Definir os campos obrigatórios do clima atual e da previsão diária, incluindo
  o comportamento para dados ausentes.
- Definir o fuso horário usado para determinar “hoje”, além dos formatos de
  data e hora exibidos em pt-BR.
- Definir o comportamento da busca: quantidade e ordenação dos resultados,
  debounce, mínimo de caracteres, busca por teclado e tratamento de cidades
  homônimas.
- Definir o contrato de integração com a Open-Meteo: endpoints, variáveis,
  códigos meteorológicos, timeout, retry, cache e mapeamento de erros.
- Decidir se unidade e última cidade serão persistidas localmente; a decisão
  de não persistir dados em servidor não resolve esse ponto.
- Transformar desempenho, disponibilidade, responsividade e acessibilidade em
  metas mensuráveis e definir os navegadores e tamanhos de tela suportados.

## Riscos

- **Ambiguidade na busca:** nomes iguais ou grafias alternativas podem levar o
  usuário a selecionar a cidade errada.
- **Dependência de dados externos:** indisponibilidade, lentidão, limites de uso
  ou mudanças no provedor podem impedir a consulta.
- **Diferença entre previsão e realidade:** dados meteorológicos são sujeitos a
  atualização e incerteza; a interface não deve sugerir precisão indevida.
- **Conversão incorreta de unidades:** erros de arredondamento ou aplicação
  parcial da conversão podem gerar informações inconsistentes.
- **Experiência móvel insuficiente:** telas pequenas podem prejudicar a leitura
  da previsão ou a interação com a busca.
- **Dados desatualizados:** uma resposta antiga pode ser exibida depois de uma
  busca mais recente se as requisições concorrentes não forem controladas.
- **Acessibilidade incompleta:** componentes visuais sem semântica ou feedback
  de estado podem excluir usuários que navegam por teclado ou leitor de tela.

## Perguntas em Aberto

- Qual é o público prioritário e em quais países ou regiões a aplicação será
  utilizada?
- A busca deve aceitar apenas cidades ou também CEP, localização atual e
  coordenadas?
- Quantos resultados devem ser apresentados para uma busca e como devem ser
  ordenados?
- Quais dados compõem exatamente o “clima atual”: temperatura, sensação
  térmica, umidade, vento, pressão, visibilidade e precipitação?
- A previsão de cinco dias deve incluir horários detalhados ou somente um resumo
  diário?
- A unidade escolhida deve ser persistida localmente entre sessões ou apenas
  durante a sessão atual?
- Quais são os limites de uso, cobertura, licença e disponibilidade da
  Open-Meteo para o MVP?
- Como a aplicação deve se comportar quando a cidade existe, mas não há dados
  meteorológicos disponíveis?
- É necessário exibir a hora local da cidade e considerar o fuso horário?
- Existem requisitos de métricas, privacidade, analytics ou conformidade?
- Quais navegadores, tamanhos de tela e níveis de conectividade devem ser
  oficialmente suportados?
- Há necessidade de favoritos, histórico, alertas, compartilhamento ou uso
  offline após o MVP?
- Quais metas de desempenho e disponibilidade serão usadas para validar o
  produto?

## Suposições

- O primeiro lançamento será uma experiência de consulta sem autenticação.
- O usuário selecionará uma cidade a partir de resultados fornecidos pelo
  sistema, em vez de inserir coordenadas manualmente.
- O provedor de dados oferecerá geocodificação e previsão atualizada para as
  localidades suportadas.
- A previsão será apresentada em visão diária resumida, salvo decisão diferente
  do negócio.
- Celsius será a unidade padrão inicial, com Fahrenheit disponível como
  alternativa.
- A conversão de unidade será feita no cliente a partir dos dados obtidos, sem
  uma nova requisição ao provedor.
- A aplicação terá acesso à internet durante a consulta; modo offline não faz
  parte do MVP.
- O escopo inicial não inclui alertas meteorológicos, mapas, radar,
  notificações, favoritos ou personalização avançada.
- A interface será responsiva e terá como prioridade telas móveis, mantendo
  suporte a desktop.
- Os dados poderão ser exibidos apenas como informação de consulta, sem uso para
  decisões críticas de segurança ou saúde.