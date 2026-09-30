# Especificação de Produto — Weather App

## Overview

O Weather App é uma aplicação de consulta meteorológica para pessoas que desejam localizar uma cidade, verificar suas condições atuais e planejar os próximos dias. O MVP prioriza uma consulta rápida, clara e responsiva, especialmente em dispositivos móveis, com interface em português do Brasil.

**Objetivos do produto**

- Permitir que a pessoa encontre e identifique a cidade desejada.
- Apresentar as condições atuais e um resumo diário de cinco dias dessa cidade.
- Permitir alternar entre Celsius e Fahrenheit sem repetir a busca meteorológica.
- Comunicar carregamento, ausência de dados e falhas de forma compreensível.

**Limites conhecidos**

- A previsão de cinco dias inclui o dia atual e os quatro dias seguintes.
- Celsius é a unidade inicial; Fahrenheit também está disponível.
- Open-Meteo é a fonte definida para geocodificação e dados meteorológicos; cobertura, limites e licença precisam ser validados antes da publicação.
- Não há autenticação nem persistência de dados em servidor no MVP.

## Functional Requirements

### FR-01 — Buscar e selecionar uma cidade

O sistema deve permitir que a pessoa pesquise uma cidade pelo nome e escolha uma correspondência. A busca é submetida pelo botão ou por Enter. Espaços externos são ignorados; a consulta deve conter ao menos uma letra ou dígito. São exibidos no máximo cinco resultados, na ordem recebida do geocoding. Localidades homônimas devem incluir contexto geográfico que as diferencie. Busca vazia ou sem resultados não seleciona cidade nem inicia consulta meteorológica.

### FR-02 — Exibir condições meteorológicas atuais

Após a seleção de uma cidade, o sistema deve apresentar a cidade, a temperatura, a condição meteorológica, umidade relativa, velocidade do vento, precipitação no intervalo atual e pressão atmosférica quando esses dados forem fornecidos. Campos ausentes devem ser identificados como “Indisponível”, sem estimar valores. A condição pode ser texto ou ícone com nome acessível. A fonte deve ser identificada. O horário de atualização deve ser exibido no fuso local da cidade quando fornecido; se ausente, a interface deve informar que o horário não foi fornecido e que a atualidade dos dados é desconhecida. Dados com até 60 minutos de idade são atuais; dados mais antigos são marcados como desatualizados.

### FR-03 — Exibir previsão diária de cinco dias

Para a cidade selecionada, o sistema deve apresentar cinco datas consecutivas: o dia atual e os quatro dias seguintes, calculados no fuso horário local da cidade. Cada dia deve incluir data no formato DD/MM/AAAA, condição meteorológica, temperaturas máxima e mínima, probabilidade máxima de precipitação e acumulado diário de precipitação. Campos ausentes devem ser identificados como “Indisponível”, sem estimar valores. Se todos os dados de previsão estiverem indisponíveis, as cinco datas continuam visíveis, enquanto as condições atuais continuam disponíveis quando houver dados atuais. Se o fuso da cidade não estiver disponível, o sistema não usa o fuso do dispositivo para inventar as datas e informa que a previsão não está disponível.

### FR-04 — Alternar unidade de temperatura

O sistema deve oferecer Celsius e Fahrenheit, iniciando em Celsius em cada nova sessão. A unidade escolhida deve ser aplicada às condições atuais e à previsão, com valores arredondados ao inteiro mais próximo (empates arredondados para longe de zero) e unidade identificada. A alternância não deve exigir nova consulta meteorológica.

### FR-05 — Comunicar carregamento, erro e ausência de seleção

O sistema deve indicar carregamento durante buscas, orientar a pessoa antes da seleção de uma cidade e apresentar um estado de erro com as ações “Tentar novamente” e “Nova busca” quando uma consulta falhar. “Tentar novamente” repete a mesma operação somente após ação explícita da pessoa; não há novas tentativas automáticas. Após sucesso ou erro, deve ser possível iniciar outra busca.

### FR-06 — Manter coerência dos dados apresentados

Os resultados atuais e a previsão devem corresponder à cidade selecionada. Ao selecionar outra cidade, os dados da cidade anterior devem ser removidos até a nova consulta terminar. Falhas de rede, respostas incompletas e ausência de dados não devem interromper a interface. A idade dos dados deve ser comunicada conforme FR-02.

## User Stories

O discovery não define personas formais. Os perfis abaixo são descrições funcionais provisórias, limitadas aos contextos de uso identificados; a definição do público prioritário permanece em aberto.

- **US-01 / FR-01:** Como pessoa que consulta o tempo de uma cidade, quero buscar e selecionar uma localidade para ver informações do lugar correto.
- **US-02 / FR-02:** Como pessoa que precisa saber as condições do tempo agora, quero consultar o clima atual de uma cidade para entender as condições locais.
- **US-03 / FR-03:** Como pessoa que planeja os próximos dias, quero consultar a previsão diária de cinco dias para me preparar para as condições esperadas.
- **US-04 / FR-04:** Como pessoa que prefere uma unidade de temperatura, quero alternar entre Celsius e Fahrenheit para interpretar os valores com facilidade.
- **US-05 / FR-05:** Como pessoa que está fazendo uma consulta, quero receber retorno claro durante carregamentos, ausência de resultados e falhas para saber o que ocorreu e como continuar.
- **US-06 / FR-06:** Como pessoa que consulta dados meteorológicos de uma cidade selecionada, quero que as informações exibidas correspondam à localidade e ao momento da consulta para evitar interpretar dados incorretos.

## Acceptance Criteria

Os critérios abaixo seguem Given/When/Then (Dado/Quando/Então) e descrevem resultados que podem ser verificados em testes. Os comportamentos que dependem de decisões ainda abertas devem ser refinados quando essas decisões forem tomadas.

### US-01 / FR-01 — Busca e seleção

- **AC-01.1:** **Given** uma busca cuja fonte retorna sete correspondências, **When** a pessoa submete o nome pelo botão ou pela tecla Enter, **Then** são exibidos os cinco primeiros resultados selecionáveis, na mesma ordem recebida da fonte.
- **AC-01.2:** **Given** localidades homônimas, **When** os resultados são apresentados, **Then** os qualificadores geográficos exibidos tornam único o rótulo de cada localidade na lista.
- **AC-01.3:** **Given** resultados de busca visíveis, **When** a pessoa seleciona uma localidade, **Then** o nome da localidade selecionada fica visível e é usado como identificação dos dados meteorológicos apresentados.
- **AC-01.4:** **Given** uma resposta bem-sucedida de geocoding sem correspondências, **When** a busca termina, **Then** o sistema exibe “Nenhuma cidade encontrada”, mantém o texto pesquisado editável, não seleciona uma localidade, não apresenta resultados anteriores e não inicia consulta meteorológica.
- **AC-01.5:** **Given** o campo de busca vazio ou preenchido apenas com espaços, **When** a pessoa submete a busca, **Then** o campo permanece disponível, uma orientação de preenchimento é exibida e nenhuma consulta de geocoding é enviada.
- **AC-01.6:** **Given** resultados de teste para nomes como “São José” e “L'Haÿ-les-Roses”, **When** a pessoa submete esses nomes, **Then** acentos e pontuação são preservados na consulta e no nome retornado.
- **AC-01.7:** **Given** um campo contendo apenas pontuação ou símbolos, **When** a pessoa submete a busca, **Then** o sistema solicita um nome com ao menos uma letra ou dígito e não envia consulta de geocoding.

### US-02 / FR-02 — Condições atuais

- **AC-02.1:** **Given** uma localidade selecionada com temperatura e condição disponíveis, **When** a consulta termina, **Then** a tela exibe a localidade, temperatura com unidade e condição em texto ou ícone com nome acessível, além das métricas atuais fornecidas pela fonte.
- **AC-02.2:** **Given** dados atuais com ou sem horário de atualização, **When** esses dados são exibidos, **Then** o horário é apresentado no fuso da cidade quando fornecido; caso contrário, a interface exibe “Horário de atualização não informado” e “Atualidade não verificada”.
- **AC-02.3:** **Given** uma localidade selecionada cuja resposta não contém nenhum campo meteorológico atual, **When** a consulta termina, **Then** a tela exibe “Condições atuais indisponíveis” e não exibe valores meteorológicos.
- **AC-02.4:** **Given** uma resposta atual com pelo menos um campo meteorológico válido e outro ausente, **When** os dados são exibidos, **Then** cada campo válido permanece visível e cada campo ausente é identificado como “Indisponível”.
- **AC-02.5:** **Given** um horário de atualização exatamente 60 minutos antes do horário atual e, em outro caso, 61 minutos antes, **When** os dados são exibidos, **Then** o primeiro caso não exibe o rótulo “Desatualizado” e o segundo exibe esse rótulo.

### US-03 / FR-03 — Previsão de cinco dias

- **AC-03.1:** **Given** uma localidade com fuso horário conhecido, **When** a previsão é exibida, **Then** são apresentadas cinco datas consecutivas calculadas nesse fuso: o dia atual e os quatro seguintes.
- **AC-03.2:** **Given** os dados de previsão dos cinco dias, **When** cada dia é exibido, **Then** seu bloco contém data, condição meteorológica, temperaturas máxima e mínima com unidades, probabilidade máxima de precipitação e acumulado diário de precipitação em milímetros.
- **AC-03.3:** **Given** uma previsão exibida, **When** a pessoa consulta a tela, **Then** a identificação da localidade selecionada também está visível junto à previsão.
- **AC-03.4:** **Given** dados ausentes para uma ou mais das cinco datas, **When** a previsão é exibida, **Then** as cinco datas continuam visíveis, cada campo ausente é identificado como “Indisponível” e nenhum valor meteorológico ausente é inventado.
- **AC-03.5:** **Given** uma cidade com fuso conhecido e condições atuais disponíveis, mas sem qualquer dado de previsão, **When** a consulta termina, **Then** as condições atuais são exibidas, as cinco datas permanecem visíveis com campos “Indisponível” e nenhuma previsão é inventada.
- **AC-03.6:** **Given** uma cidade sem fuso horário disponível, **When** a previsão é solicitada, **Then** nenhuma data é calculada com o fuso do dispositivo e a interface informa “Previsão indisponível: fuso horário não informado”.

### US-04 / FR-04 — Unidade de temperatura

- **AC-04.1:** **Given** uma sessão sem unidade previamente selecionada e temperaturas disponíveis, **When** os dados meteorológicos são exibidos pela primeira vez, **Then** todas as temperaturas são identificadas em Celsius (°C).
- **AC-04.2:** **Given** dados meteorológicos atuais e previsão já exibidos, **When** a pessoa seleciona Celsius ou Fahrenheit, **Then** todas as temperaturas atuais e diárias passam a usar a unidade escolhida e mostram seu símbolo correspondente.
- **AC-04.3:** **Given** dados de teste de -40 °C, 0 °C e 100 °C, **When** a pessoa alterna para Fahrenheit, **Then** são exibidos, respectivamente, -40 °F, 32 °F e 212 °F; ao alternar de volta, os valores originais são exibidos em °C, arredondados ao inteiro mais próximo.
- **AC-04.4:** **Given** dados meteorológicos já carregados, **When** a pessoa alterna a unidade, **Then** a localidade e os dados permanecem disponíveis e nenhuma nova consulta meteorológica é enviada à fonte.
- **AC-04.5:** **Given** uma temperatura de teste de 20,5 °C, **When** a pessoa alterna para Fahrenheit, **Then** o valor é exibido como 69 °F; ao retornar a Celsius, o valor é exibido como 21 °C.

### US-05 / FR-05 — Estados da interação

- **AC-05.1:** **Given** uma busca ou consulta meteorológica ainda pendente por 200 ms, **When** esse intervalo termina sem resposta, **Then** a interface exibe um indicador de carregamento correspondente à operação.
- **AC-05.2:** **Given** que nenhuma localidade foi selecionada, **When** a tela inicial é apresentada, **Then** a interface exibe uma orientação não vazia para iniciar uma busca.
- **AC-05.3:** **Given** uma consulta que termina em falha, **When** o erro é apresentado, **Then** a interface exibe “Não foi possível concluir a consulta”, a ação “Tentar novamente” para repetir a mesma operação somente após ativação e a ação “Nova busca”.
- **AC-05.4:** **Given** uma busca anterior concluída ou com erro, **When** a pessoa informa e submete outro nome de cidade, **Then** o sistema inicia uma nova busca.
- **AC-05.5:** **Given** uma falha de geocoding ou meteorológica, **When** o estado de erro é exibido, **Then** nenhuma resposta anterior é apresentada como resultado da consulta que falhou.
- **AC-05.6:** **Given** uma requisição sem resposta, **When** oito segundos se passam desde seu início, **Then** a requisição termina, o indicador de carregamento é encerrado e a interface exibe “A consulta demorou mais que o esperado” com as ações “Tentar novamente” e “Nova busca”.

### US-06 / FR-06 — Coerência dos dados

- **AC-06.1:** **Given** dados meteorológicos da localidade A exibidos, **When** a pessoa seleciona a localidade B, **Then** os dados de A são removidos imediatamente e B fica identificada enquanto sua consulta está pendente.
- **AC-06.2:** **Given** consultas meteorológicas de A e B pendentes, **When** B termina antes e a resposta de A chega depois, **Then** somente os dados de B são exibidos.
- **AC-06.3:** **Given** dados meteorológicos exibidos, **When** a pessoa consulta a seção de condições, **Then** “Open-Meteo” é identificada como fonte e o horário é apresentado ou indicado como não informado, conforme AC-02.2.

## Non-Functional Requirements

### NFR-01 — Responsividade

- A experiência deve funcionar em larguras de viewport de 320 a 1920 pixels CSS, sem rolagem horizontal para acessar conteúdo ou controles.
- Controles interativos devem ter área mínima de 44 por 44 pixels CSS.
- A busca, os resultados e os cinco dias da previsão devem permanecer disponíveis e legíveis em toda a faixa de viewport suportada.

### NFR-02 — Usabilidade e acessibilidade

- Textos, unidades, resultados e estados devem ser compreensíveis para pessoas não técnicas.
- A interface deve atender ao nível AA da WCAG 2.2.
- Campos, controles e resultados interativos devem ter nomes acessíveis, foco visível e operação completa por teclado; busca deve ser submetida pelo botão ou por Enter.
- Estados de carregamento, erro e ausência de resultados devem ser anunciados por tecnologias assistivas sem exigir foco manual no texto da mensagem.

### NFR-03 — Desempenho

- A alternância de unidade deve atualizar os valores visíveis em até 100 ms após a ação.
- Se uma busca ou consulta meteorológica continuar pendente, o estado de carregamento deve aparecer em até 200 ms após seu início.
- Após a resposta da fonte, os dados devem aparecer na interface em até 500 ms.
- A alternância de unidade não deve gerar uma nova consulta meteorológica.
- Os limites de 100 ms, 200 ms e 500 ms são medidos em testes automatizados com resposta externa controlada; o tempo de rede do provedor não integra o limite de renderização de 500 ms. Os testes cobrem viewports de 360 x 800 e 1280 x 800 pixels CSS.

### NFR-04 — Confiabilidade e resiliência

- Falhas de rede, respostas incompletas e ausência de resultados devem ser tratados sem interromper a interface.
- A interface não deve associar dados de uma cidade a outra cidade selecionada.
- A apresentação deve evitar sugerir precisão ou atualidade além do que a fonte fornece.
- Requisições sem resposta devem atingir timeout após oito segundos e apresentar o estado de erro definido nos critérios de aceite.
- A disponibilidade da fonte externa não é garantida pelo produto; indisponibilidade deve seguir os critérios de erro e permitir uma nova busca.

### NFR-05 — Compatibilidade e manutenção

- A aplicação deve funcionar nas duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari, em desktop e dispositivos móveis.
- A origem externa de geocodificação e dados meteorológicos deve poder ser mantida ou substituída sem alterar os requisitos percebidos pela pessoa usuária.

### NFR-06 — Idioma e contexto regional

- Os textos da interface devem ser apresentados em português do Brasil.
- Datas devem usar DD/MM/AAAA e horários locais, quando exibidos, devem usar o formato de 24 horas.

### NFR-07 — Privacidade e uso de dados

- O MVP não deve usar analytics nem rastreamento publicitário, nem solicitar ou transmitir a localização precisa do dispositivo.
- O nome da cidade enviado para busca é transmitido à Open-Meteo. Uma política de privacidade acessível deve informar essa transferência antes da publicação.

## Matriz de Rastreabilidade

Cada linha relaciona a story aos critérios que a verificam e aos NFRs que impõem condições relevantes de implementação ou validação.

| User Story / Requisito funcional | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- |
| US-01 / FR-01 — Buscar e selecionar cidade | AC-01.1–AC-01.7 | NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-02 / FR-02 — Exibir condições atuais | AC-02.1–AC-02.5 | NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |
| US-03 / FR-03 — Exibir previsão de cinco dias | AC-03.1–AC-03.6 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05, NFR-06 |
| US-04 / FR-04 — Alternar unidade | AC-04.1–AC-04.5 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06 |
| US-05 / FR-05 — Estados da interação | AC-05.1–AC-05.6 | NFR-02, NFR-03, NFR-04, NFR-05 |
| US-06 / FR-06 — Coerência dos dados | AC-06.1–AC-06.3 | NFR-02, NFR-03, NFR-04, NFR-05, NFR-06, NFR-07 |

## Edge Cases

- **Cidade inexistente ou sem correspondência:** exibir um estado explícito de “nenhuma cidade encontrada”, manter o texto da busca editável, não selecionar uma cidade e não solicitar a previsão.
- **Input vazio ou só com espaços:** exibir orientação para informar uma cidade, manter o campo disponível e não enviar uma consulta de geocoding.
- **Caracteres especiais em nomes de cidades:** preservar acentos e pontuação em nomes pesquisados e resultados. Se a entrada tiver apenas pontuação ou símbolos, solicitar um nome com ao menos uma letra ou dígito e não enviar a consulta.
- **Falha de API ou de rede:** exibir estado de erro, não mostrar dados antigos como se fossem resposta da consulta atual e permitir uma nova busca.
- **Timeout:** após oito segundos sem resposta, encerrar o estado de carregamento, informar que a consulta demorou e oferecer retry explícito ou nova busca.
- **Geocoding sem resultados:** tratar uma resposta bem-sucedida sem localidades como estado vazio, sem selecionar cidade nem solicitar dados meteorológicos; manter a busca disponível.
- **Resposta meteorológica parcial ou previsão totalmente ausente:** manter os campos válidos, exibir “Indisponível” para os demais e não inferir valores; se apenas a previsão faltar, manter as condições atuais visíveis.
- **Fuso horário ausente:** não usar o fuso do dispositivo para escolher “hoje”; informar que a previsão não está disponível.
- Várias cidades com o mesmo nome, grafias alternativas ou ausência de contexto regional na resposta.
- Cidade selecionada sem dados meteorológicos atuais ou sem previsão para um ou mais dias.
- Resposta externa inválida ou incompatível com a cidade selecionada.
- Consulta antiga concluída depois de uma busca mais recente; dados antigos não podem substituir nem ser confundidos com os da cidade atual.
- Alternância de unidade durante ou depois do carregamento, sem perda da cidade selecionada e sem consulta meteorológica redundante.
- Mudança de data no fuso local da cidade durante uma sessão; a lista de datas deve refletir o dia atual nesse fuso.
- Tela estreita ou uso por teclado/leitor de tela durante busca, carregamento e apresentação de erro.

## Assumptions

- O MVP é uma experiência de consulta sem contas ou armazenamento em servidor e requer conexão com a internet.
- A interface e o conteúdo são apresentados em português do Brasil; o público e os países suportados ainda dependem de validação de produto.
- Os dados meteorológicos são informativos e não devem embasar decisões críticas de segurança ou saúde.

## Risks

- **Cidade incorreta por homonímia ou grafia:** exibir contexto geográfico nos resultados e preservar a ordem fornecida pelo serviço de geocoding.
- **Dependência do provedor externo:** validar cobertura, limites, licença e disponibilidade da Open-Meteo antes da publicação; definir comportamento de falha e indisponibilidade.
- **Dados meteorológicos incompletos ou desatualizados:** comunicar ausência e contexto temporal, sem preencher valores faltantes com suposições.
- **Previsão interpretada como certeza:** apresentar os dados como previsão e evitar alegações de precisão não sustentadas pela fonte.
- **Conversão ou identificação incorreta da unidade:** verificar equivalência dos valores atuais e diários e a unidade de cada temperatura.
- **Resultados fora de ordem em consultas sucessivas:** garantir que os dados visíveis correspondam à seleção mais recente.
- **Experiência móvel ou acessibilidade insuficiente:** validar nas larguras suportadas, com teclado e tecnologias assistivas, conforme WCAG 2.2 AA.
- **Dados externos indisponíveis ou degradados:** a aplicação informa a falha e permite nova busca; não há SLA de disponibilidade do provedor definido pelo produto.

## Out of Scope

- Contas, autenticação, perfis, armazenamento em servidor ou persistência local da cidade e da unidade entre sessões.
- Analytics, rastreamento publicitário e localização precisa do dispositivo.
- Sensação térmica, visibilidade e outros campos meteorológicos não definidos nos requisitos funcionais.
- Previsão horária, atualização automática em segundo plano e notificações meteorológicas.
- Favoritos, histórico de buscas, alertas, mapas, radar, compartilhamento e modo offline.
- Busca por CEP, localização atual ou coordenadas.
- Idiomas além de pt-BR e personalização avançada.
- Uso dos dados para aconselhamento médico, decisões críticas de segurança ou garantia de condições meteorológicas.

## Open Questions

**Bloqueios antes da publicação**

1. Definir os países e regiões de lançamento e validar neles a cobertura de geocoding e previsão da Open-Meteo.
2. Confirmar licença, atribuição exigida, limites de uso e disponibilidade/SLA aplicáveis à Open-Meteo.
3. Validar requisitos legais de privacidade para os mercados escolhidos e aprovar a política que informa a transmissão do nome da cidade ao provedor.

**Decisões para versões futuras**

4. Avaliar se o produto deve adicionar outros campos meteorológicos, idiomas ou funcionalidades excluídas em Out of Scope.