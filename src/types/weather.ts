export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  country?: string;
  countryCode?: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  observedAt: string | null;
  localTime: string | null;
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minimumC: number | null;
  maximumC: number | null;
  precipitationProbabilityPercent?: number | null;
  precipitationSumMm?: number | null;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  timezone: string | null;
  source: 'Open-Meteo';
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface WeatherUiState {
  status: RequestStatus;
  phase: 'search' | 'weather';
  query: string;
  cityResults: City[];
  selectedCity: City | null;
  weather: WeatherData | null;
  unit: Unit;
  errorMessage: string | null;
}
