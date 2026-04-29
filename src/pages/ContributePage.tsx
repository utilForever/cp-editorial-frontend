import { Fragment } from 'react'
import { Trans, useTranslation } from 'react-i18next'

function renderBacktickBold(text: string) {
  const segments = text.split(/`([^`]+)`/g)

  return segments.map((segment, index) =>
    index % 2 === 1 ? (
      <strong key={`bold-${index}`}>{segment}</strong>
    ) : (
      <Fragment key={`text-${index}`}>{segment}</Fragment>
    ),
  )
}

export function ContributePage() {
  const { t } = useTranslation()

  return (
    <section className="page">
      <h1>{t('contribute.heading')}</h1>
      <p className="page__description">
        <Trans
          components={{
            repo: (
              <a
                href="https://github.com/utilForever/cp-editorial-data"
                rel="noreferrer"
                target="_blank"
              />
            ),
          }}
          i18nKey="contribute.description"
        />
      </p>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('contribute.structure.heading')}</h2>
        <p className="card__meta">{renderBacktickBold(t('contribute.structure.description'))}</p>
        <pre className="guide-code">{renderBacktickBold(t('contribute.structure.example'))}</pre>
        <ul className="home-article__list">
          <li>{renderBacktickBold(t('contribute.structure.rule1'))}</li>
          <li>{renderBacktickBold(t('contribute.structure.rule2'))}</li>
          <li>{renderBacktickBold(t('contribute.structure.rule3'))}</li>
        </ul>
      </article>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('contribute.workflow.heading')}</h2>
        <ol className="guide-list">
          <li>{renderBacktickBold(t('contribute.workflow.step1'))}</li>
          <li>{renderBacktickBold(t('contribute.workflow.step2'))}</li>
          <li>{renderBacktickBold(t('contribute.workflow.step3'))}</li>
          <li>{renderBacktickBold(t('contribute.workflow.step4'))}</li>
          <li>{renderBacktickBold(t('contribute.workflow.step5'))}</li>
          <li>{renderBacktickBold(t('contribute.workflow.step6'))}</li>
        </ol>
      </article>

      <article className="card contribute-guide">
        <h2 className="card__title">{t('contribute.checklist.heading')}</h2>
        <ul className="guide-list">
          <li>{renderBacktickBold(t('contribute.checklist.item1'))}</li>
          <li>{renderBacktickBold(t('contribute.checklist.item2'))}</li>
          <li>{renderBacktickBold(t('contribute.checklist.item3'))}</li>
          <li>{renderBacktickBold(t('contribute.checklist.item4'))}</li>
        </ul>
      </article>

      <p className="muted">{t('contribute.footer')}</p>
    </section>
  )
}
