import { toGeorgianMtavruli } from '../utils/text'

export default function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-page__card" aria-labelledby="not-found-title">
        <p className="not-found-page__code" aria-hidden="true">404</p>
        <h1 id="not-found-title">{toGeorgianMtavruli('გვერდი ვერ მოიძებნა')}</h1>
        <p>მისამართი შესაძლოა შეცვლილია ან გვერდი ჯერ არ არის გამოქვეყნებული.</p>
        <div className="not-found-page__actions">
          <a className="button button--primary" href="/">{toGeorgianMtavruli('მთავარ გვერდზე დაბრუნება')}</a>
          <a className="button button--secondary" href="/#services">{toGeorgianMtavruli('სერვისების ნახვა')}</a>
        </div>
      </section>
    </main>
  )
}
