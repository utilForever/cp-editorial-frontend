import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useThemePreference } from '../hooks/useThemePreference'
import { LanguageSelector } from './LanguageSelector'
import { ThemeSelector } from './ThemeSelector'

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return `layout__link${isActive ? ' layout__link--active' : ''}`
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      className="layout__menu-icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function Layout() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemePreference()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const year = new Date().getFullYear()
  const mobileMenuId = 'mobile-navigation-menu'

  function renderSecondaryLinks(onNavigate?: () => void) {
    return (
      <>
        <NavLink className={navLinkClassName} onClick={onNavigate} to="/" end>
          {t('nav.home')}
        </NavLink>
        <NavLink className={navLinkClassName} onClick={onNavigate} to="/categories">
          {t('nav.categories')}
        </NavLink>
        <NavLink className={navLinkClassName} onClick={onNavigate} to="/contribute">
          {t('nav.contribute')}
        </NavLink>
        <NavLink className={navLinkClassName} onClick={onNavigate} to="/copyright">
          {t('nav.copyright')}
        </NavLink>
      </>
    )
  }

  return (
    <div className="layout">
      <header className="layout__header">
        <div className="layout__header-inner">
          <Link className="layout__brand" to="/">
            {t('appTitle')}
          </Link>
          <nav className="layout__nav">
            <NavLink
              className={({ isActive }) =>
                `${navLinkClassName({ isActive })} layout__link--primary`
              }
              onClick={() => setIsMobileMenuOpen(false)}
              to="/search"
            >
              {t('nav.search')}
            </NavLink>
            <div className="layout__nav-desktop">
              {renderSecondaryLinks()}
              <ThemeSelector onThemeChange={setTheme} theme={theme} />
              <LanguageSelector />
            </div>
            <button
              aria-controls={mobileMenuId}
              aria-expanded={isMobileMenuOpen}
              aria-label={t('nav.menu')}
              className="layout__menu-button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              type="button"
            >
              <MenuIcon />
              <span>{t('nav.menu')}</span>
            </button>
            <div className="layout__mobile-menu" hidden={!isMobileMenuOpen} id={mobileMenuId}>
              <div className="layout__mobile-links">
                {renderSecondaryLinks(() => setIsMobileMenuOpen(false))}
              </div>
              <div className="layout__mobile-preferences">
                <ThemeSelector onThemeChange={setTheme} theme={theme} />
                <LanguageSelector id="mobile-language-selector" />
              </div>
            </div>
          </nav>
        </div>
      </header>
      <main className="layout__content">
        <Outlet />
      </main>
      <footer className="layout__footer">
        <div className="layout__footer-inner">
          <section className="layout__footer-brand">
            <p className="layout__footer-logo">{t('appTitle')}</p>
            <p className="layout__footer-description">{t('footer.description')}</p>
            <p className="layout__footer-description">
              {t('footer.dataSource')}{' '}
              <a
                className="layout__footer-external"
                href="https://github.com/utilForever/cp-editorial-data"
                rel="noreferrer"
                target="_blank"
              >
                {t('footer.links.dataRepo')}
              </a>
            </p>
          </section>

          <div className="layout__footer-grid">
            <section className="layout__footer-column">
              <h2 className="layout__footer-heading">{t('footer.explore.heading')}</h2>
              <Link className="layout__footer-link" to="/search">
                {t('footer.explore.search')}
              </Link>
              <Link className="layout__footer-link" to="/categories">
                {t('footer.explore.categories')}
              </Link>
              <Link className="layout__footer-link" to="/contribute">
                {t('footer.explore.contribute')}
              </Link>
              <Link className="layout__footer-link" to="/copyright">
                {t('footer.explore.copyright')}
              </Link>
            </section>

            <section className="layout__footer-column">
              <h2 className="layout__footer-heading">{t('footer.links.heading')}</h2>
              <a
                className="layout__footer-link"
                href="https://github.com/utilForever/cp-editorial-data"
                rel="noreferrer"
                target="_blank"
              >
                {t('footer.links.dataRepo')}
              </a>
              <a
                className="layout__footer-link"
                href="https://github.com/utilForever/cp-editorial-frontend"
                rel="noreferrer"
                target="_blank"
              >
                {t('footer.links.frontendRepo')}
              </a>
            </section>

            <section className="layout__footer-column">
              <h2 className="layout__footer-heading">{t('footer.community.heading')}</h2>
              <a
                className="layout__footer-link"
                href="https://github.com/utilForever/cp-editorial-frontend/issues"
                rel="noreferrer"
                target="_blank"
              >
                {t('footer.community.issues')}
              </a>
              <a
                className="layout__footer-link"
                href="https://github.com/utilForever/cp-editorial-frontend/discussions"
                rel="noreferrer"
                target="_blank"
              >
                {t('footer.community.discussions')}
              </a>
            </section>
          </div>
        </div>

        <div className="layout__footer-bottom">
          <span>{t('footer.copyright', { year })}</span>
          <a
            className="layout__footer-external"
            href="https://editorial.coduck.io"
            rel="noreferrer"
            target="_blank"
          >
            {t('footer.site')}
          </a>
        </div>
      </footer>
    </div>
  )
}
