import { type FormEvent, type Ref, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  inputRef?: Ref<HTMLInputElement>;
}

export default function SearchBar({ onSearch, disabled = false, inputRef }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = value.trim();
    if (disabled) return;
    if (!city || !/[\p{L}\p{N}]/u.test(city)) {
      setValidationMessage(
        city
          ? 'Digite o nome da cidade usando letras ou números.'
          : 'Informe o nome de uma cidade.',
      );
      return;
    }
    setValidationMessage('');
    onSearch(city);
  }

  return (
    <form role="search" aria-busy={disabled} onSubmit={handleSubmit} className="w-full max-w-md">
      <label htmlFor="city-search" className="sr-only">
        Buscar cidade
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-400">
        <input
          ref={inputRef}
          id="city-search"
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setValidationMessage('');
          }}
          disabled={disabled}
          aria-invalid={validationMessage !== ''}
          aria-describedby={validationMessage ? 'city-search-error' : undefined}
          placeholder="Buscar cidade"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/50 focus:outline-none disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 rounded-md bg-accent-500 px-4 text-sm font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {validationMessage && (
        <p id="city-search-error" role="status" className="mt-2 text-sm text-white/80">
          {validationMessage}
        </p>
      )}
    </form>
  );
}
