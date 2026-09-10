/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Адрес запущенного api_analyze.py (репозиторий Shyn). См. shynApiClient.ts. */
  readonly VITE_SHYN_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
