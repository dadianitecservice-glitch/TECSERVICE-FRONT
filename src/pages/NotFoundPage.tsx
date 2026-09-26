import { useTranslation } from '../i18n/LocaleProvider'
import { toGeorgianMtavruli } from '../utils/text'

export default function NotFoundPage() {
  const l10n = useTranslation()
  return (
    <main className="not-found-page">
      <section className="not-found-page__card" aria-labelledby="not-found-title">
        <p className="not-found-page__code" aria-hidden="true">404</p>
        <h1 id="not-found-title">{l10n.t(toGeorgianMtavruli('გვერდი ვერ მოიძებნა'))}</h1>
        <p>{l10n.t("მისამართი შესაძლოა შეცვლილია ან გვერდი ჯერ არ არის გამოქვეყნებული.")}</p>
        <div className="not-found-page__actions">
          <a className="button button--primary" href={l10n.href("/")}>{l10n.t(toGeorgianMtavruli('მთავარ გვერდზე დაბრუნება'))}</a>
          <a className="button button--secondary" href={l10n.href("/#services")}>{l10n.t(toGeorgianMtavruli('სერვისების ნახვა'))}</a>
        </div>
      </section>
    </main>
  )
}
