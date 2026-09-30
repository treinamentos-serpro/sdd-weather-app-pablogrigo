# Tarefas de Implementação — Weather App

Backlog derivado de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md)
e organizado pela ordem de dependência. Cada tarefa tem um único foco
testável, limita os arquivos ao necessário para esse foco e separa
implementação, integração e testes.

## Entrega 1 — Fundação e tipos

### T-01 — Confirmar a fundação de desenvolvimento

- **Descrição:** Verificar os scripts e configurações existentes para a stack do projeto.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` terminam com código zero ou cada falha tem comando, saída e causa registrados.
  - Os scripts de lint, build e teste referenciam as ferramentas previstas no plano.
  - Não é adicionada biblioteca de estado, cliente HTTP ou cache.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-02 — Criar os tipos normalizados do domínio

- **Descrição:** Definir os tipos internos sem acoplamento ao JSON da Open-Meteo.
- **Critérios de aceite:**
  - Existem `Unit`, `City`, `CurrentWeather`, `ForecastDay` e `WeatherData`.
  - Temperaturas internas usam Celsius e ausências usam `null`.
  - Existem `RequestStatus` e `WeatherUiState` com `phase` para busca ou clima.
  - O TypeScript strict compila os contratos sem tipos implícitos.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data

## Entrega 2 — Regras puras

### T-03 — Implementar conversão de temperatura

- **Descrição:** Criar a conversão pura entre Celsius e Fahrenheit e os símbolos de unidade.
- **Critérios de aceite:**
  - `-40 °C`, `0 °C` e `100 °C` convertem para `-40 °F`, `32 °F` e `212 °F`.
  - A função preserva o valor Celsius de origem e não faz I/O.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-04 — Implementar arredondamento meteorológico

- **Descrição:** Criar o arredondamento ao inteiro mais próximo, com empates para longe de zero.
- **Critérios de aceite:**
  - `20,5 °C` é exibido como `21 °C` e como `69 °F` após conversão.
  - Valores `20,5` e `-20,5` são arredondados para `21` e `-21`, respectivamente.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data

### T-05 — Mapear códigos WMO para apresentação

- **Descrição:** Mapear códigos meteorológicos para rótulos em pt-BR e fallback acessível.
- **Critérios de aceite:**
  - Códigos WMO conhecidos retornam rótulos não vazios em pt-BR.
  - Código desconhecido retorna fallback sem quebrar a apresentação.
  - O mapeamento não substitui o código armazenado no modelo.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data

### T-06 — Implementar datas e idade dos dados

- **Descrição:** Criar funções puras para datas no fuso informado, horário local e idade da atualização.
- **Critérios de aceite:**
  - Datas usam `DD/MM/AAAA` e horários usam formato de 24 horas.
  - Exatamente 60 minutos não marca o dado como desatualizado; 61 minutos marca.
  - Horário ausente gera estado de atualização não informada e atualidade não verificada.
  - Sem fuso da cidade, a função não usa o fuso do dispositivo para calcular datas.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/dateTime.ts`.
- **Tipo:** Data

## Entrega 3 — Serviços da Open-Meteo

### T-07 — Construir a requisição de geocoding

- **Descrição:** Encapsular URL, parâmetros e timeout da busca de cidades.
- **Critérios de aceite:**
  - A URL usa `URLSearchParams`, `count=5`, `language=pt` e `format=json`.
  - O nome é aparado e preserva acentos e pontuação.
  - A requisição tem timeout de oito segundos e não depende de React.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-08 — Adaptar resultados de geocoding

- **Descrição:** Converter resultados externos em `City` e tratar lista vazia.
- **Critérios de aceite:**
  - No máximo cinco cidades são retornadas na ordem do provedor.
  - `country_code` é convertido para `countryCode` e qualificadores são preservados.
  - Resultado vazio não seleciona cidade nem inicia consulta de previsão.
  - JSON incompatível e HTTP inválido geram erro tratável.
- **Dependências:** T-07.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-09 — Construir a requisição de previsão

- **Descrição:** Encapsular a URL de forecast por latitude e longitude.
- **Critérios de aceite:**
  - `current` solicita temperatura, condição, umidade, vento, precipitação e pressão; `daily` solicita temperaturas, condição, probabilidade e acumulado de precipitação.
  - A URL usa `forecast_days=5`, `timezone=auto` e `temperature_unit=celsius`.
  - A cidade selecionada é passada ao serviço sem ser reconstruída pela resposta.
  - Timeout e falhas de rede são propagados para o consumidor.
- **Dependências:** T-02, T-07.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-10 — Adaptar condições atuais da previsão

- **Descrição:** Normalizar temperatura, código, horário e métricas meteorológicas atuais para `CurrentWeather`.
- **Critérios de aceite:**
  - Temperatura, código WMO, umidade, velocidade do vento, precipitação e pressão são mapeados com suas unidades documentadas.
  - Campos ausentes viram `null` sem descartar os campos válidos.
  - Ausência total de condições atuais é representada sem inventar valores.
- **Dependências:** T-06, T-09.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

### T-11 — Adaptar previsão diária e fuso

- **Descrição:** Normalizar os cinco dias, precipitação, arrays parciais e fuso em `WeatherData`.
- **Critérios de aceite:**
  - Cada índice diário gera data, código, mínima, máxima, probabilidade e acumulado de precipitação, usando `null` para ausências.
  - Com fuso conhecido, cinco datas consecutivas permanecem disponíveis mesmo sem valores meteorológicos.
  - Sem fuso, a previsão fica indisponível e não usa o fuso do dispositivo.
  - A cidade selecionada e `source: 'Open-Meteo'` permanecem no resultado.
- **Dependências:** T-06, T-09, T-10.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data

## Entrega 4 — Orquestração de estado

### T-12 — Implementar busca no hook

- **Descrição:** Implementar em `useWeather` a validação e a transição da busca de cidades.
- **Critérios de aceite:**
  - Vazio, espaços e símbolos são rejeitados sem chamada ao serviço.
  - Busca válida muda para `loading/search`, preserva a consulta e termina em `success`, `empty` ou `error`.
  - Busca sem resultados limpa resultados anteriores e não seleciona cidade.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-13 — Implementar seleção e consulta meteorológica no hook

- **Descrição:** Implementar a transição de seleção de cidade até sucesso ou erro de previsão.
- **Critérios de aceite:**
  - Selecionar cidade limpa imediatamente o clima anterior e define `loading/weather`.
  - Sucesso publica `WeatherData` normalizado para a cidade selecionada.
  - Falha limpa o resultado anterior e define mensagem de erro na fase `weather`.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-14 — Implementar retry e nova busca

- **Descrição:** Adicionar ações explícitas para repetir a operação com erro ou reiniciar a busca.
- **Critérios de aceite:**
  - Retry repete apenas a operação que falhou, com os mesmos parâmetros.
  - Nova busca limpa seleção, clima e erro e retorna a `idle`.
  - Não existe retry automático.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-15 — Implementar unidade no hook

- **Descrição:** Controlar a unidade de apresentação sem alterar o snapshot meteorológico.
- **Critérios de aceite:**
  - A unidade começa em Celsius em cada sessão.
  - Alterá-la não chama o serviço nem muda o status de carregamento.
  - O clima armazenado permanece em Celsius.
- **Dependências:** T-03, T-13.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

### T-16 — Proteger seleções concorrentes

- **Descrição:** Invalidar requisições antigas com identificador e `AbortController`.
- **Critérios de aceite:**
  - Nova seleção aborta ou invalida a requisição anterior.
  - Resposta tardia ou erro da cidade A não altera a seleção B.
  - Nenhum dado antigo é exibido enquanto B está pendente.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data

## Entrega 5 — Componentes de busca e estados

### T-17 — Criar o formulário de busca

- **Descrição:** Implementar o campo e o formulário controlado de busca.
- **Critérios de aceite:**
  - Botão e tecla Enter submetem o formulário.
  - Campo e botão têm nomes acessíveis, foco visível e operação por teclado.
  - O componente recebe callbacks e não faz HTTP.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI

### T-18 — Criar a lista de resultados

- **Descrição:** Implementar a lista selecionável de cidades.
- **Critérios de aceite:**
  - São exibidos até cinco itens na ordem recebida.
  - O nome e cada qualificador geográfico presente no objeto `City` aparecem no item correspondente.
  - Cada resultado é acessível por teclado e dispara o callback de seleção.
- **Dependências:** T-02, T-17.
- **Arquivos prováveis:** `src/components/CityResults.tsx`.
- **Tipo:** UI

### T-19 — Criar o estado inicial

- **Descrição:** Implementar a orientação para iniciar uma busca.
- **Critérios de aceite:**
  - A tela inicial exibe uma orientação não vazia para buscar uma cidade.
  - A mensagem tem nome acessível e não simula uma busca.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/states/InitialState.tsx`.
- **Tipo:** UI

### T-20 — Criar o estado de loading

- **Descrição:** Implementar o indicador de carregamento para busca ou clima.
- **Critérios de aceite:**
  - O componente recebe a fase por props e comunica se é busca ou consulta meteorológica.
  - A mensagem é anunciada por tecnologia assistiva.
  - O componente não inicia nem controla requisições.
- **Dependências:** T-12, T-13.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI

### T-21 — Criar o estado vazio

- **Descrição:** Implementar a mensagem para busca sem resultados.
- **Critérios de aceite:**
  - Exibe “Nenhuma cidade encontrada”.
  - Mantém orientação para nova busca e não renderiza resultados anteriores.
  - A mensagem é anunciada de forma acessível.
- **Dependências:** T-12.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI

### T-22 — Criar o estado de erro

- **Descrição:** Implementar erro com retry e nova busca controlados por props.
- **Critérios de aceite:**
  - Exibe a mensagem recebida, incluindo a mensagem específica de timeout.
  - “Tentar novamente” e “Nova busca” disparam somente seus callbacks.
  - Ações têm nomes acessíveis e foco visível.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI

## Entrega 6 — Componentes meteorológicos

### T-23 — Criar o painel de condições atuais

- **Descrição:** Renderizar cidade, temperatura e condição atual.
- **Critérios de aceite:**
  - Temperatura, umidade, vento, precipitação e pressão são exibidos quando disponíveis; ausências mostram “Indisponível”.
  - Condição tem rótulo acessível e ausência total mostra “Condições atuais indisponíveis”.
- **Dependências:** T-04, T-05, T-10, T-15.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-24 — Exibir fonte e atualidade no painel atual

- **Descrição:** Completar os metadados temporais e a fonte das condições atuais.
- **Critérios de aceite:**
  - “Open-Meteo” e o horário local são exibidos quando disponíveis.
  - Dados antigos exibem “Desatualizado”; ausência de horário exibe “Atualidade não verificada”.
- **Dependências:** T-06, T-10, T-23.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI

### T-25 — Criar a lista de previsão

- **Descrição:** Renderizar os cinco dias e seus campos meteorológicos.
- **Critérios de aceite:**
  - Cada dia exibe data, condição, máxima e mínima com a unidade escolhida, probabilidade de chuva e acumulado de precipitação.
  - Datas usam `DD/MM/AAAA` e ausências mostram “Indisponível”.
  - As cinco datas e a cidade permanecem identificadas quando a previsão está sem valores.
- **Dependências:** T-04, T-05, T-06, T-11, T-15.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI

### T-26 — Exibir indisponibilidade de fuso na previsão

- **Descrição:** Renderizar o estado de previsão sem fuso horário.
- **Critérios de aceite:**
  - Sem fuso, exibe “Previsão indisponível: fuso horário não informado”.
  - Não calcula datas usando o fuso do dispositivo.
- **Dependências:** T-11, T-25.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Tipo:** UI

### T-27 — Criar o controle de unidade

- **Descrição:** Implementar o controle visual Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Celsius é a opção inicial e ambas as opções têm nome acessível.
  - A área interativa mede ao menos 44 × 44 px e tem foco visível.
  - A troca chama apenas o callback recebido.
- **Dependências:** T-15.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI

## Entrega 7 — Integração da aplicação

### T-28 — Compor a tela principal

- **Descrição:** Integrar hook e componentes em `App`.
- **Critérios de aceite:**
  - Cada fase do estado renderiza o componente correspondente.
  - `idle`, `loading/search`, `loading/weather`, `empty`, `error/search`, `error/weather` e `success` têm uma ramificação de renderização verificável.
  - `App` passa dados e callbacks por props sem duplicar estado de domínio.
  - Nenhum componente de apresentação faz HTTP.
- **Dependências:** T-16, T-17, T-18, T-19, T-20, T-21, T-22, T-23, T-25, T-27.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI

### T-29 — Aplicar estilos responsivos

- **Descrição:** Ajustar o layout Tailwind para a faixa de larguras suportada.
- **Critérios de aceite:**
  - Não há rolagem horizontal entre 320 e 1920 px.
  - Em 360 × 800 e 1280 × 800, busca, resultados e previsão ficam dentro do viewport, sem texto cortado ou overflow horizontal.
- **Dependências:** T-28.
- **Arquivos prováveis:** `src/index.css`.
- **Tipo:** UI

### T-30 — Aplicar foco e áreas de toque

- **Descrição:** Ajustar os estilos de foco e dimensões mínimas dos controles.
- **Critérios de aceite:**
  - Controles interativos têm área mínima de 44 × 44 px.
  - O foco é visível em busca, resultados, ações de estado e unidade.
- **Dependências:** T-28.
- **Arquivos prováveis:** `src/index.css`, `tailwind.config.js`.
- **Tipo:** UI

## Entrega 8 — Testes unitários

### T-31 — Testar conversão de unidade

- **Descrição:** Testar a conversão Celsius/Fahrenheit e o arredondamento meteorológico sem rede.
- **Critérios de aceite:**
  - Testa `-40`, `0`, `100` e `20,5` °C convertidos para Fahrenheit e exibidos com unidade.
  - Testa a conversão inversa e os empates `20,5` e `-20,5`, sem rede ou relógio real.
- **Dependências:** T-03, T-04.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test

### T-32 — Testar códigos meteorológicos

- **Descrição:** Verificar rótulos WMO conhecidos e fallback desconhecido.
- **Critérios de aceite:**
  - Códigos de céu limpo, chuva e tempestade têm rótulos em pt-BR.
  - Código desconhecido retorna fallback acessível.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test

### T-33 — Testar datas e idade dos dados

- **Descrição:** Verificar formatação local, fuso ausente e limiar de atualização.
- **Critérios de aceite:**
  - Testa `DD/MM/AAAA`, horário 24 horas e datas consecutivas no fuso informado.
  - Testa exatamente 60 e 61 minutos com relógio e fuso controlados.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/dateTime.test.ts`.
- **Tipo:** Test

### T-34 — Testar requisição de geocoding

- **Descrição:** Verificar a requisição de geocoding usando `fetch` mockado.
- **Critérios de aceite:**
  - Verifica `count=5`, `language=pt`, `format=json` e a consulta aparada com acentos/pontuação.
  - Verifica timeout de oito segundos sem chamar a API real.
  - Substitui `global.fetch` por um mock e verifica método, URL e `AbortSignal` recebidos.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/weatherService.geocoding-request.test.ts`.
- **Tipo:** Test

### T-35 — Testar adaptação e erros de geocoding

- **Descrição:** Verificar a normalização e as falhas do geocoding com respostas de `fetch` mockadas.
- **Critérios de aceite:**
  - Verifica no máximo cinco resultados, ordem, homônimos e `country_code` convertido.
  - Verifica lista vazia, HTTP inválido, JSON incompatível e falha de rede.
  - Cada cenário usa uma resposta ou rejeição controlada do mock de `fetch` e não acessa a Open-Meteo real.
- **Dependências:** T-08, T-34.
- **Arquivos prováveis:** `tests/unit/weatherService.geocoding-adapter.test.ts`.
- **Tipo:** Test

### T-36 — Testar requisição de forecast

- **Descrição:** Verificar a requisição de forecast usando `fetch` mockado.
- **Critérios de aceite:**
  - Verifica latitude, longitude, `current`, `daily`, `forecast_days=5`, `timezone=auto` e Celsius.
  - Substitui `global.fetch` por um mock e verifica propagação de falhas de rede e HTTP sem chamar a API real.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/weatherService.forecast-request.test.ts`.
- **Tipo:** Test

### T-37 — Testar adaptação das condições atuais

- **Descrição:** Verificar a normalização do bloco atual do forecast com payload de `fetch` mockado.
- **Critérios de aceite:**
  - Mapeia temperatura, código e horário para Celsius e campos internos.
  - Representa campos ausentes como `null` sem descartar campos válidos.
  - O payload é fornecido pelo mock de `fetch`, sem dependência de rede externa.
- **Dependências:** T-10, T-36.
- **Arquivos prováveis:** `tests/unit/weatherService.current-adapter.test.ts`.
- **Tipo:** Test

### T-38 — Testar adaptação diária e fuso

- **Descrição:** Verificar a normalização da previsão diária e das datas com payload de `fetch` mockado.
- **Critérios de aceite:**
  - Verifica cinco índices, arrays desalinhados, campos nulos e ausência total de previsão.
  - Verifica datas consecutivas com fuso, ausência de fuso e preservação da cidade selecionada.
  - Todos os payloads são fornecidos por mock de `fetch` e nenhum teste chama a API real.
- **Dependências:** T-11, T-37.
- **Arquivos prováveis:** `tests/unit/weatherService.forecast-adapter.test.ts`.
- **Tipo:** Test

### T-39 — Testar busca no hook

- **Descrição:** Validar as transições de busca de `useWeather`.
- **Critérios de aceite:**
  - Busca vazia, espaços ou símbolos não chamam o serviço.
  - Busca válida produz loading, sucesso, vazio ou erro e remove resultados obsoletos.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/useWeather.search.test.ts`.
- **Tipo:** Test

### T-40 — Testar seleção meteorológica no hook

- **Descrição:** Validar a consulta de clima após selecionar uma cidade.
- **Critérios de aceite:**
  - Seleção limpa o snapshot anterior e identifica a nova cidade durante o loading.
  - Sucesso publica o clima normalizado e falha limpa dados antigos com erro na fase `weather`.
- **Dependências:** T-13, T-39.
- **Arquivos prováveis:** `tests/unit/useWeather.weather-selection.test.ts`.
- **Tipo:** Test

### T-41 — Testar retry e nova busca no hook

- **Descrição:** Validar as ações explícitas de recuperação.
- **Critérios de aceite:**
  - Retry repete somente a fase que falhou com os mesmos parâmetros.
  - Nova busca limpa seleção, clima e erro e retorna a `idle`.
- **Dependências:** T-14, T-40.
- **Arquivos prováveis:** `tests/unit/useWeather.retry.test.ts`.
- **Tipo:** Test

### T-42 — Testar unidade no hook

- **Descrição:** Validar a unidade de apresentação sem nova consulta.
- **Critérios de aceite:**
  - Unidade inicia em Celsius e pode mudar para Fahrenheit.
  - A troca não chama o serviço, não muda o status e mantém o clima em Celsius.
- **Dependências:** T-15, T-40.
- **Arquivos prováveis:** `tests/unit/useWeather.unit.test.ts`.
- **Tipo:** Test

### T-43 — Testar concorrência no hook

- **Descrição:** Verificar que respostas fora de ordem não corrompem a seleção atual.
- **Critérios de aceite:**
  - A resposta de B permanece visível quando A termina depois.
  - Erro tardio de A não substitui B e a requisição anterior é abortada ou ignorada.
- **Dependências:** T-16, T-40.
- **Arquivos prováveis:** `tests/unit/useWeather.concurrency.test.ts`.
- **Tipo:** Test

### T-44 — Testar o formulário de busca

- **Descrição:** Validar submissão, teclado, rótulo e foco do formulário.
- **Critérios de aceite:**
  - Botão e Enter acionam o callback de busca uma vez.
  - Campo e botão têm nomes acessíveis e foco visível.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.
- **Tipo:** Test

### T-45 — Testar a lista de resultados

- **Descrição:** Validar renderização e seleção acessível das cidades.
- **Critérios de aceite:**
  - Até cinco itens aparecem na ordem recebida com qualificadores de homônimos.
  - Um resultado pode ser alcançado e selecionado por teclado.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/CityResults.test.tsx`.
- **Tipo:** Test

### T-46 — Testar componentes nos estados inicial e loading

- **Descrição:** Validar orientação inicial e carregamento anunciado.
- **Critérios de aceite:**
  - A orientação inicial é exibida sem seleção.
  - Loading informa a fase e é anunciado sem exigir foco manual.
- **Dependências:** T-19, T-20.
- **Arquivos prováveis:** `tests/unit/InitialState.test.tsx`, `tests/unit/LoadingState.test.tsx`.
- **Tipo:** Test

### T-47 — Testar componentes nos estados vazio e erro

- **Descrição:** Validar mensagens e ações de recuperação.
- **Critérios de aceite:**
  - Vazio exibe a mensagem correta sem resultados anteriores.
  - Erro exibe mensagem, retry e nova busca, acionando apenas o callback correspondente.
- **Dependências:** T-21, T-22.
- **Arquivos prováveis:** `tests/unit/EmptyState.test.tsx`, `tests/unit/ErrorState.test.tsx`.
- **Tipo:** Test

### T-48 — Testar condições atuais na apresentação

- **Descrição:** Validar valores, indisponibilidade, fonte e atualidade.
- **Critérios de aceite:**
  - Cobre temperatura, condição, campos nulos e ausência total.
  - Verifica fonte, horário, “Desatualizado” e “Atualidade não verificada”.
- **Dependências:** T-23, T-24.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.
- **Tipo:** Test

### T-49 — Testar previsão na apresentação

- **Descrição:** Validar cinco dias, campos indisponíveis e ausência de fuso.
- **Critérios de aceite:**
  - Cinco dias exibem data, condição, máxima e mínima na unidade recebida.
  - Campos ausentes e falta de fuso exibem as mensagens definidas.
- **Dependências:** T-25, T-26.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test

### T-50 — Testar controle de unidade

- **Descrição:** Validar acessibilidade e callback do controle Celsius/Fahrenheit.
- **Critérios de aceite:**
  - Celsius aparece selecionado inicialmente e ambas as opções são nomeadas.
  - A ativação altera a opção e dispara o callback sem fazer rede.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test

## Entrega 9 — Testes E2E

### T-51 — Testar fluxo E2E principal em desktop e mobile

- **Descrição:** Validar o fluxo principal de busca, seleção e carregamento em desktop e viewport mobile.
- **Critérios de aceite:**
  - Em viewport desktop e em `360 × 800`, busca por botão ou Enter exibe até cinco resultados determinísticos.
  - Nos dois viewports, selecionar uma cidade identifica a cidade correta e inicia apenas seu forecast.
  - Após a resposta interceptada, nos dois viewports a cidade, as condições atuais e os cinco dias da previsão ficam visíveis.
  - As APIs são interceptadas pelo Playwright e nenhuma execução depende da Open-Meteo real.
- **Dependências:** T-28, T-35, T-44, T-45.
- **Arquivos prováveis:** `tests/e2e/weather-search.spec.ts`.
- **Tipo:** Test

### T-52 — Testar clima e troca de unidade no navegador

- **Descrição:** Validar condições, cinco dias e conversão no fluxo completo.
- **Critérios de aceite:**
  - Cidade, condição e cinco dias ficam visíveis com resposta controlada.
  - Alternar para Fahrenheit atualiza os valores sem nova requisição meteorológica.
- **Dependências:** T-28, T-42, T-48, T-49, T-50.
- **Arquivos prováveis:** `tests/e2e/weather-results.spec.ts`.
- **Tipo:** Test

### T-53 — Testar vazio e erro no navegador

- **Descrição:** Validar ausência de resultados e falha de geocoding.
- **Critérios de aceite:**
  - Busca sem resultados não inicia forecast nem mostra resultados anteriores.
  - Erro permite retry e nova busca e não exibe dados antigos como resposta atual.
- **Dependências:** T-28, T-47.
- **Arquivos prováveis:** `tests/e2e/weather-errors.spec.ts`.
- **Tipo:** Test

### T-54 — Testar timeout e recuperação no navegador

- **Descrição:** Validar o timeout de oito segundos e suas ações.
- **Critérios de aceite:**
  - Requisição pendente termina com a mensagem de timeout.
  - Retry repete a operação e nova busca retorna ao formulário sem dados antigos.
- **Dependências:** T-22, T-41, T-53.
- **Arquivos prováveis:** `tests/e2e/weather-timeout.spec.ts`.
- **Tipo:** Test

### T-55 — Testar teclado no navegador

- **Descrição:** Validar busca, seleção e recuperação sem mouse.
- **Critérios de aceite:**
  - O fluxo de busca e seleção funciona apenas com teclado.
  - Foco visível e ações de erro podem ser operados pelo teclado.
- **Dependências:** T-30, T-44, T-45, T-47, T-51.
- **Arquivos prováveis:** `tests/e2e/weather-keyboard.spec.ts`.
- **Tipo:** Test

### T-56 — Testar responsividade no navegador

- **Descrição:** Verificar layout e áreas de toque nos viewports definidos.
- **Critérios de aceite:**
  - Viewports 360 × 800 e 1280 × 800 não têm rolagem horizontal.
  - Nos dois viewports, campo, resultados, ações, previsão e controle de unidade podem receber foco e ser ativados sem sair da área visível.
- **Dependências:** T-29, T-30, T-52.
- **Arquivos prováveis:** `tests/e2e/weather-responsive.spec.ts`.
- **Tipo:** Test

### T-57 — Testar desempenho no navegador

- **Descrição:** Verificar os limites de loading, renderização e unidade com rede controlada.
- **Critérios de aceite:**
  - Loading aparece em até 200 ms e dados em até 500 ms após a resposta.
  - Troca de unidade conclui em até 100 ms e não faz nova requisição.
- **Dependências:** T-52, T-56.
- **Arquivos prováveis:** `tests/e2e/weather-performance.spec.ts`.
- **Tipo:** Test

## Entrega 10 — Hardening e entrega

### T-58 — Revisar acessibilidade da aplicação

- **Descrição:** Executar a revisão de foco, nomes, anúncios e operação por teclado.
- **Critérios de aceite:**
  - Loading, erro e vazio são anunciados sem foco manual na mensagem.
  - Pendências de avaliação manual WCAG 2.2 AA ficam registradas.
- **Dependências:** T-46, T-47, T-55, T-56, T-57.
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`.
- **Tipo:** Test

### T-59 — Registrar compatibilidade suportada

- **Descrição:** Verificar navegadores e viewports previstos e documentar limitações.
- **Critérios de aceite:**
  - As duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari são cobertas ou têm limitação registrada.
  - Viewports suportados e eventuais pendências ficam documentados.
- **Dependências:** T-56, T-58.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Test

### T-60 — Executar o lint

- **Descrição:** Executar o gate de lint e registrar falhas.
- **Critérios de aceite:**
  - `pnpm lint` é executado.
  - Falhas são corrigidas ou registradas com causa e impacto.
- **Dependências:** T-28, T-29, T-30, T-58, T-59.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-61 — Executar o build

- **Descrição:** Executar o gate de build TypeScript/Vite.
- **Critérios de aceite:**
  - `pnpm build` é executado sem erros ou a falha fica registrada.
  - Nenhuma funcionalidade fora do escopo é adicionada para contornar o erro.
- **Dependências:** T-60.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-62 — Executar os testes unitários

- **Descrição:** Executar o conjunto Vitest e registrar falhas.
- **Critérios de aceite:**
  - `pnpm test` é executado cobrindo as tarefas T-31 a T-50.
  - Falhas ficam corrigidas ou registradas com causa e impacto.
- **Dependências:** T-60, T-61, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T-48, T-49, T-50.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-63 — Executar os testes E2E

- **Descrição:** Executar o conjunto Playwright e registrar falhas.
- **Critérios de aceite:**
  - `pnpm test:e2e` é executado cobrindo as tarefas T-51 a T-58.
  - Falhas ficam corrigidas ou registradas com causa e impacto.
- **Dependências:** T-62, T-51, T-52, T-53, T-54, T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `package.json`.
- **Tipo:** Infra

### T-64 — Validar cobertura e condições da Open-Meteo

- **Descrição:** Confirmar cobertura dos mercados-alvo, licença, atribuição, limites de uso e disponibilidade do provedor.
- **Critérios de aceite:**
  - Cobertura de geocoding e forecast é verificada para as regiões de lançamento.
  - Licença, atribuição exigida, limites e disponibilidade/SLA são registrados.
  - Qualquer bloqueio de publicação ou necessidade de trocar o provedor é explicitado.
- **Dependências:** T-60, T-61, T-62, T-63.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra

### T-65 — Aprovar política de privacidade do MVP

- **Descrição:** Documentar e obter aprovação para a transferência do nome da cidade à Open-Meteo.
- **Critérios de aceite:**
  - A política informa que o nome pesquisado é transmitido ao provedor externo.
  - A política é acessível a partir da aplicação ou do material de publicação.
  - A aprovação legal para os mercados-alvo é registrada antes da publicação.
- **Dependências:** T-64.
- **Arquivos prováveis:** `README.md`, `docs/privacy.md`.
- **Tipo:** Infra

### T-66 — Consolidar documentação de publicação

- **Descrição:** Registrar fonte de dados, decisões de escopo, ausência de rastreamento e o resultado das validações externas.
- **Critérios de aceite:**
  - O README informa uso da Open-Meteo e ausência de autenticação, analytics, rastreamento e geolocalização precisa.
  - Os resultados de T-64 e T-65 estão vinculados à decisão de publicar ou bloquear.
  - Não são introduzidos cache, retry automático, persistência ou funcionalidades fora do escopo.
- **Dependências:** T-64, T-65.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra

## Rastreabilidade com a spec

Cada tarefa abaixo aponta para pelo menos um requisito funcional, critério de
aceite ou requisito não funcional da spec. Tarefas de qualidade e publicação
apontam para os NFRs e para as questões abertas que bloqueiam o lançamento.

| Tarefa | Requisitos relacionados |
| --- | --- |
| T-01 | NFR-05; gates definidos no plano |
| T-02 | FR-02, FR-03, FR-04, FR-06; AC-02.3, AC-03.4, AC-04.1, AC-06.1 |
| T-03 | FR-04; AC-04.3, AC-04.5 |
| T-04 | FR-04; AC-04.2, AC-04.3, AC-04.5 |
| T-05 | FR-02, FR-03; AC-02.1, AC-03.2 |
| T-06 | FR-02, FR-03; AC-02.2, AC-02.5, AC-03.1; NFR-06 |
| T-07 | FR-01, FR-05; AC-01.6, AC-01.7, AC-05.6; NFR-05 |
| T-08 | FR-01, FR-06; AC-01.1–AC-01.4, AC-01.6; NFR-04 |
| T-09 | FR-02, FR-03, FR-05; AC-02.1, AC-03.1, AC-05.6 |
| T-10 | FR-02; AC-02.3, AC-02.4 |
| T-11 | FR-03, FR-06; AC-03.1–AC-03.6, AC-06.3 |
| T-12 | FR-01, FR-05; AC-01.5, AC-01.7, AC-05.4 |
| T-13 | FR-02, FR-06; AC-02.1–AC-02.5, AC-05.5, AC-06.1 |
| T-14 | FR-05; AC-05.3–AC-05.6 |
| T-15 | FR-04; AC-04.1–AC-04.4, NFR-03 |
| T-16 | FR-06; AC-06.1, AC-06.2; NFR-04 |
| T-17 | FR-01; AC-01.1, AC-01.5; NFR-02 |
| T-18 | FR-01; AC-01.1–AC-01.3; NFR-02 |
| T-19 | FR-05; AC-05.2 |
| T-20 | FR-05; AC-05.1; NFR-02, NFR-03 |
| T-21 | FR-01, FR-05; AC-01.4; NFR-02 |
| T-22 | FR-05; AC-05.3, AC-05.6; NFR-02 |
| T-23 | FR-02; AC-02.1, AC-02.3, AC-02.4 |
| T-24 | FR-02, FR-06; AC-02.2, AC-02.5, AC-06.3 |
| T-25 | FR-03; AC-03.1–AC-03.5; NFR-06 |
| T-26 | FR-03; AC-03.6; NFR-04 |
| T-27 | FR-04; AC-04.1, AC-04.2; NFR-01, NFR-02 |
| T-28 | FR-01–FR-06; AC-01.1–AC-06.3 |
| T-29 | NFR-01, NFR-06 |
| T-30 | NFR-01, NFR-02 |
| T-31 | FR-04; AC-04.3, AC-04.5 |
| T-32 | FR-02, FR-03; AC-02.1, AC-03.2 |
| T-33 | FR-02, FR-03; AC-02.2, AC-02.5, AC-03.1; NFR-06 |
| T-34 | FR-01, FR-05; AC-01.6, AC-01.7, AC-05.6 |
| T-35 | FR-01, FR-06; AC-01.1–AC-01.4, AC-01.6; NFR-04 |
| T-36 | FR-02, FR-03, FR-05; AC-02.1, AC-03.1, AC-05.6 |
| T-37 | FR-02; AC-02.3, AC-02.4 |
| T-38 | FR-03, FR-06; AC-03.1–AC-03.6, AC-06.3 |
| T-39 | FR-01, FR-05; AC-01.5, AC-01.7, AC-05.4 |
| T-40 | FR-02, FR-06; AC-02.1, AC-05.5, AC-06.1 |
| T-41 | FR-05; AC-05.3, AC-05.4 |
| T-42 | FR-04; AC-04.1–AC-04.4; NFR-03 |
| T-43 | FR-06; AC-06.2; NFR-04 |
| T-44 | FR-01; AC-01.1, AC-01.5; NFR-02 |
| T-45 | FR-01; AC-01.1–AC-01.3; NFR-02 |
| T-46 | FR-05; AC-05.1, AC-05.2; NFR-02, NFR-03 |
| T-47 | FR-01, FR-05; AC-01.4, AC-05.3, AC-05.5; NFR-02 |
| T-48 | FR-02; AC-02.1–AC-02.5 |
| T-49 | FR-03; AC-03.1–AC-03.6 |
| T-50 | FR-04; AC-04.1, AC-04.2; NFR-02 |
| T-51 | FR-01–FR-03; AC-01.1–AC-01.3, AC-02.1, AC-03.1–AC-03.3, AC-05.4; NFR-01, NFR-03 |
| T-52 | FR-02–FR-04; AC-02.1, AC-03.1–AC-03.3, AC-04.2–AC-04.4 |
| T-53 | FR-01, FR-05, FR-06; AC-01.4, AC-05.3–AC-05.5 |
| T-54 | FR-05; AC-05.6; NFR-04 |
| T-55 | FR-01, FR-05; NFR-02 |
| T-56 | FR-01, FR-03, FR-04; NFR-01 |
| T-57 | FR-04, FR-05; NFR-03 |
| T-58 | FR-05; NFR-02 |
| T-59 | NFR-05 |
| T-60 | NFR-05; gate de qualidade do plano |
| T-61 | NFR-05; gate de qualidade do plano |
| T-62 | NFR-04, NFR-05; estratégia de testes da spec |
| T-63 | NFR-01–NFR-05; estratégia de testes da spec |
| T-64 | NFR-05; Open Questions 1 e 2 |
| T-65 | NFR-07; Open Question 3 |
| T-66 | NFR-05, NFR-07; Out of Scope e Open Questions 1–3 |

## Matriz de requisitos funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de validação | Cobertura |
| --- | --- | --- | --- |
| **FR-01 — Buscar e selecionar uma cidade** | T-07, T-08, T-12, T-17, T-18, T-21, T-28 | T-34, T-35, T-39, T-44, T-45, T-51, T-53, T-55 | Coberto |
| **FR-02 — Exibir condições meteorológicas atuais** | T-06, T-09, T-10, T-23, T-24, T-28 | T-33, T-36, T-37, T-48, T-51, T-52 | Coberto |
| **FR-03 — Exibir previsão diária de cinco dias** | T-06, T-09, T-11, T-25, T-26, T-28 | T-33, T-36, T-38, T-49, T-51, T-52, T-56 | Coberto |
| **FR-04 — Alternar unidade de temperatura** | T-03, T-04, T-15, T-27, T-28 | T-31, T-42, T-50, T-52, T-57 | Coberto |
| **FR-05 — Comunicar loading, erro e ausência de seleção** | T-07, T-09, T-12, T-13, T-14, T-19, T-20, T-21, T-22, T-28 | T-39, T-41, T-46, T-47, T-51, T-53, T-54, T-55, T-57 | Coberto |
| **FR-06 — Manter coerência dos dados apresentados** | T-02, T-08, T-10, T-11, T-13, T-16, T-24, T-25, T-28 | T-35, T-38, T-40, T-43, T-48, T-51, T-53 | Coberto |

### Requisitos sem tarefa correspondente

Nenhum requisito funcional da spec está sem tarefa correspondente. Os seis
requisitos (`FR-01` a `FR-06`) possuem tarefas de implementação e pelo menos
uma tarefa de validação unitária ou E2E.

## Prioridade e tamanho

P0 representa o caminho mínimo do MVP até uma consulta visível; P1 representa
resiliência, acessibilidade e qualidade necessária antes de considerar o MVP
pronto; P2 representa hardening de publicação, compatibilidade e validações
externas. O tamanho é relativo à tarefa individual: P (pequena), M (média) e
G (grande), considerando escopo, risco e esforço de verificação.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | P |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | P |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | P |
| T-11 | P0 | G |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | P |
| T-16 | P1 | M |
| T-17 | P0 | M |
| T-18 | P0 | M |
| T-19 | P0 | P |
| T-20 | P0 | P |
| T-21 | P0 | P |
| T-22 | P0 | M |
| T-23 | P0 | M |
| T-24 | P1 | P |
| T-25 | P0 | M |
| T-26 | P1 | P |
| T-27 | P0 | P |
| T-28 | P0 | G |
| T-29 | P1 | M |
| T-30 | P1 | P |
| T-31 | P0 | P |
| T-32 | P0 | P |
| T-33 | P0 | M |
| T-34 | P0 | P |
| T-35 | P0 | M |
| T-36 | P0 | P |
| T-37 | P0 | P |
| T-38 | P0 | M |
| T-39 | P0 | M |
| T-40 | P0 | M |
| T-41 | P0 | M |
| T-42 | P0 | P |
| T-43 | P1 | M |
| T-44 | P0 | P |
| T-45 | P0 | P |
| T-46 | P0 | P |
| T-47 | P0 | M |
| T-48 | P0 | M |
| T-49 | P0 | M |
| T-50 | P0 | P |
| T-51 | P0 | G |
| T-52 | P0 | M |
| T-53 | P1 | M |
| T-54 | P1 | M |
| T-55 | P1 | M |
| T-56 | P1 | M |
| T-57 | P1 | M |
| T-58 | P1 | M |
| T-59 | P2 | M |
| T-60 | P0 | P |
| T-61 | P0 | P |
| T-62 | P0 | P |
| T-63 | P1 | M |
| T-64 | P2 | G |
| T-65 | P2 | M |
| T-66 | P2 | M |

## Sequência em fatias verticais

As fatias abaixo entregam um fluxo visível ao final de cada incremento. As
tarefas continuam respeitando suas dependências; dentro de uma fatia, testes
podem ser feitos logo após a implementação correspondente.

### Fatia 1 — Primeira tela consultável

**Objetivo visível:** pesquisar uma cidade, selecionar um resultado e exibir
condições atuais e previsão básica.

**Tarefas:** T-01, T-02, T-03, T-04, T-05, T-06, T-07, T-08, T-09, T-10,
T-11, T-12, T-13, T-14, T-15, T-16, T-17, T-18, T-19, T-20, T-21, T-22,
T-23, T-24, T-25, T-26, T-27 e T-28.

**Saída verificável:** fluxo feliz com cidade selecionada, temperatura,
condição, cinco dias e alternância inicial de unidade disponível.

### Fatia 2 — Recuperação e coerência

**Objetivo visível:** tornar o fluxo confiável quando há erro, nova seleção ou
dados incompletos.

**Tarefas:** T-29 e T-30.

**Saída verificável:** layout responsivo, foco visível e áreas de toque
ajustados sem alterar o comportamento já entregue.

### Fatia 3 — Rede e regras protegidas por testes

**Objetivo visível:** consolidar o fluxo principal com testes determinísticos
antes de ampliar cenários.

**Tarefas:** T-31 a T-50.

**Saída verificável:** funções, service com `fetch` mockado, hook e componentes
possuem testes unitários isolados.

### Fatia 4 — Fluxo principal no navegador

**Objetivo visível:** validar a experiência completa em desktop e mobile.

**Tarefas:** T-51 e T-52.

**Saída verificável:** busca → seleção → condições → cinco dias → troca de
unidade funciona com APIs interceptadas, incluindo viewport `360 × 800`.

### Fatia 5 — Cenários difíceis e qualidade

**Objetivo visível:** fechar os casos de erro e os requisitos de experiência.

**Tarefas:** T-53, T-54, T-55, T-56, T-57, T-58, T-59, T-60, T-61, T-62 e
T-63.

**Saída verificável:** erros, timeout, teclado, responsividade, desempenho,
acessibilidade, compatibilidade e gates de qualidade verificados.

### Fatia 6 — Pronto para publicação

**Objetivo visível:** remover bloqueios operacionais, legais e de documentação.

**Tarefas:** T-64, T-65 e T-66.

**Saída verificável:** cobertura e condições do provedor, privacidade e decisão
de publicação documentadas.