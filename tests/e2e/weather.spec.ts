import { expect, type Page, test } from '@playwright/test';

const city = {
  id: 1,
  name: 'Recife',
  latitude: -8.05,
  longitude: -34.88,
  country: 'Brasil',
  country_code: 'BR',
  admin1: 'Pernambuco',
};

const forecast = {
  timezone: 'America/Recife',
  utc_offset_seconds: -10_800,
  current: { time: '2026-09-30T12:00', temperature_2m: 0, weather_code: 0 },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [0, 1, 2, 3, 45],
    temperature_2m_min: [-2, 0, 1, 3, 4],
    temperature_2m_max: [5, 7, 8, 9, 10],
  },
};

async function mockWeatherApi(
  page: Page,
  geocoding: { results?: (typeof city)[] } = { results: [city] },
  forecastResponse: Record<string, unknown> = forecast,
) {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocoding });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: forecastResponse });
  });
}

async function searchRecife(page: Page) {
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Recife');
  await page.getByRole('button', { name: 'Buscar' }).click();
}

test('busca uma cidade, exibe a previsão de cinco dias e converte para Fahrenheit', async ({
  page,
}) => {
  await mockWeatherApi(page);
  await page.goto('/');
  await searchRecife(page);

  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current).toContainText('Recife');
  await expect(current).toContainText('0 °C');
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit (°F)' }).click();
  await expect(current).toContainText('32 °F');
});

test('mostra estado vazio quando geocoding não retorna results', async ({ page }) => {
  await mockWeatherApi(page, {});
  await page.goto('/');
  await searchRecife(page);

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Clima atual' })).toHaveCount(0);
});

test('orienta entrada vazia e com símbolos sem chamar geocoding', async ({ page }) => {
  let requests = 0;
  const queries: string[] = [];
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    requests += 1;
    queries.push(new URL(route.request().url()).searchParams.get('name') ?? '');
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: forecast });
  });
  await page.goto('/');

  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  const submit = page.getByRole('button', { name: 'Buscar' });
  await submit.click();
  await expect(page.getByRole('status')).toContainText('Informe o nome de uma cidade.');
  await search.fill('   ');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Informe o nome de uma cidade.');
  await search.fill('!!!');
  await submit.click();
  await expect(page.getByRole('status')).toContainText('letras ou números');
  expect(requests).toBe(0);

  await search.fill('São José');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('region', { name: 'Clima atual' })).toBeVisible();
  expect(queries).toEqual(['São José']);
});

test('mantém condições atuais e cinco datas quando o forecast está incompleto', async ({
  page,
}) => {
  await mockWeatherApi(
    page,
    { results: [city] },
    {
      timezone: 'America/Recife',
      current: { time: '2026-09-30T12:00', temperature_2m: 24 },
    },
  );
  await page.goto('/');
  await searchRecife(page);

  const current = page.getByRole('region', { name: 'Clima atual' });
  await expect(current).toContainText('24 °C');
  const days = page.getByRole('region', { name: 'Previsão de 5 dias' }).getByRole('listitem');
  await expect(days).toHaveCount(5);
  await expect(days.first()).toContainText('Indisponível');
});

test('permite repetir a busca depois de uma falha de rede offline', async ({ page }) => {
  let attempts = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.abort('internetdisconnected');
      return;
    }
    await route.fulfill({ json: { results: [city] } });
  });
  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: forecast });
  });
  await page.goto('/');
  await searchRecife(page);

  await expect(page.getByRole('alert')).toContainText('Não foi possível concluir a consulta');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('region', { name: 'Clima atual' })).toContainText('Recife');
  expect(attempts).toBe(2);
});

test('completa o fluxo de busca no viewport mobile de 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApi(page);
  await page.goto('/');
  await searchRecife(page);

  await expect(page.getByRole('region', { name: 'Clima atual' })).toContainText('Recife');
  await expect(page.getByRole('region', { name: 'Clima atual' })).toContainText('0 °C');
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fahrenheit (°F)' })).toBeVisible();
});
