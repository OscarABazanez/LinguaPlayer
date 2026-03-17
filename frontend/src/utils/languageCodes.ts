export interface Language {
  code: string;
  name: string;
  nativeName: string;
  spacyModel?: string;
  speechCode?: string;
}

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', spacyModel: 'es_core_news_sm', speechCode: 'es-ES' },
  { code: 'en', name: 'English', nativeName: 'English', spacyModel: 'en_core_web_sm', speechCode: 'en-US' },
  { code: 'fr', name: 'French', nativeName: 'Français', spacyModel: 'fr_core_news_sm', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', spacyModel: 'de_core_news_sm', speechCode: 'de-DE' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', spacyModel: 'it_core_news_sm', speechCode: 'it-IT' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', spacyModel: 'pt_core_news_sm', speechCode: 'pt-BR' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', spacyModel: 'ja_core_news_sm', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', spacyModel: 'ko_core_news_sm', speechCode: 'ko-KR' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', spacyModel: 'zh_core_web_sm', speechCode: 'zh-CN' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', spacyModel: 'ru_core_news_sm', speechCode: 'ru-RU' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code);
}

export function getSpeechCode(langCode: string): string {
  const lang = getLanguageByCode(langCode);
  return lang?.speechCode ?? langCode;
}
