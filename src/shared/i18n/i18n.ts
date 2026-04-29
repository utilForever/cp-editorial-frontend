import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language
}

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language)
  })

i18n.on('languageChanged', syncDocumentLanguage)
