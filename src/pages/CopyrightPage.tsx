import { Trans, useTranslation } from 'react-i18next'

export function CopyrightPage() {
  const { t } = useTranslation()

  return (
    <section className="page">
      <h1>{t('copyrightPage.heading')}</h1>
      <p className="page__description">{t('copyrightPage.description')}</p>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('copyrightPage.ownership.heading')}</h2>
        <p className="card__meta">
          <Trans
            components={{
              dataRepo: (
                <a
                  href="https://github.com/utilForever/cp-editorial-data"
                  rel="noreferrer"
                  target="_blank"
                />
              ),
            }}
            i18nKey="copyrightPage.ownership.body"
          />
        </p>
      </article>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('copyrightPage.attribution.heading')}</h2>
        <ul className="guide-list">
          <li>{t('copyrightPage.attribution.item1')}</li>
          <li>{t('copyrightPage.attribution.item2')}</li>
          <li>{t('copyrightPage.attribution.item3')}</li>
        </ul>
      </article>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('copyrightPage.usage.heading')}</h2>
        <p className="card__meta">{t('copyrightPage.usage.body')}</p>
      </article>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('copyrightPage.removal.heading')}</h2>
        <p className="card__meta">
          <Trans
            components={{
              issues: (
                <a
                  href="https://github.com/utilForever/cp-editorial-data/issues"
                  rel="noreferrer"
                  target="_blank"
                />
              ),
            }}
            i18nKey="copyrightPage.removal.body"
          />
        </p>
      </article>
    </section>
  )
}
