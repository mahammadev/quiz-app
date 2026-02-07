import { translations as localeTranslations } from './locales'

export type Language = 'en' | 'az' | 'ru'

export const translations = localeTranslations

export function getTranslation(lang: Language, key: string, params?: Record<string, string | number>): string {
  const dict = translations[lang] as any
  const enDict = translations.en as any

  let text = dict[key] !== undefined ? dict[key] : (enDict[key] !== undefined ? enDict[key] : key)

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }

  return text
}
