/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EPUB_PROXY?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
