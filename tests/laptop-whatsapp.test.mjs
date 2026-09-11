import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { laptopProblems, laptopProblemMessage, laptopProblemRequestUrl, laptopRequestUrl } from '../src/data/laptopRepair.ts'

test('all ten laptop issues produce contextual WhatsApp drafts with blank customer prompts and their source', () => {
  const labels = [
    'არ ირთვება',
    'ეკრანი დაზიანებულია',
    'არ იტენება',
    'ხურდება ან ითიშება',
    'კლავიატურა არ მუშაობს',
    'ნელა მუშაობს',
    'სითხით დაზიანებულია',
    'სისტემა არ იტვირთება',
    'კორპუსი ან ანჯამა დაზიანებულია',
    'პორტები არ მუშაობს',
  ]
  assert.deepEqual(laptopProblems.map(problem => problem.label), labels)
  assert.deepEqual(laptopProblems.map(problem => problem.id), ['power', 'screen', 'charging', 'heat', 'keyboard', 'slow', 'liquid', 'boot', 'hinges', 'ports'])
  const drafts = laptopProblems.map(problem => {
    assert.ok(problem.service.trim(), `Missing service context for ${problem.id}`)
    assert.ok(problem.whatsappIntro.trim(), `Missing introduction for ${problem.id}`)
    assert.equal(problem.whatsappPrompts.length, 2)
    assert.equal(new Set(problem.whatsappPrompts).size, 2)
    for (const prompt of problem.whatsappPrompts) assert.ok(prompt.trim())
    const href = laptopProblemRequestUrl(problem)
    const url = new URL(href)
    assert.equal(url.origin, 'https://wa.me')
    assert.equal(url.pathname, '/995591474040')
    assert.deepEqual([...url.searchParams.keys()], ['text'])
    assert.equal(url.hash, '')
    assert.doesNotMatch(href, /[\r\n\u10A0-\u10FF]/)
    assert.equal((href.match(/%0A/g) ?? []).length, 9)
    const message = url.searchParams.get('text')
    assert.equal(message, laptopProblemMessage(problem))
    assert.deepEqual(message.split('\n'), [
      problem.whatsappIntro,
      `საიტზე ავირჩიე: „${problem.label}“.`,
      '',
      'ლეპტოპის ბრენდი და მოდელი: [მიუთითეთ]',
      ...problem.whatsappPrompts.map(prompt => `${prompt}: [მიუთითეთ]`),
      '',
      'გთხოვთ, მითხრათ დიაგნოსტიკის პირობები, სავარაუდო ღირებულება და როდის შემიძლია მოტანა.',
      '',
      'წყარო: TECSERVICE — ლეპტოპების შეკეთება / პრობლემის არჩევის პანელი.',
    ])
    assert.equal((message.match(/\[მიუთითეთ\]/g) ?? []).length, 3)
    assert.doesNotMatch(message, /პაროლ|OTP|ერთჯერადი კოდ/i)
    return message
  })
  assert.equal(new Set(drafts).size, 10)
  assert.equal(new Set(laptopProblems.map(problem => problem.whatsappIntro)).size, 10)
})

test('issue punctuation is encoded inside the draft instead of becoming URL parameters or fragments', () => {
  const label = 'ეკრანი & კვება? #1 + 50%'
  const problem = { ...laptopProblems[0], label, whatsappPrompts: ['შეტყობინება: A&B? #1 + 50%', 'პრობლემის დაწყების დრო'] }
  const url = new URL(laptopProblemRequestUrl(problem))
  assert.deepEqual([...url.searchParams.keys()], ['text'])
  assert.equal(url.hash, '')
  assert.equal(url.searchParams.get('text').split('\n')[1], `საიტზე ავირჩიე: „${label}“.`)
  assert.ok(url.searchParams.get('text').includes(`${problem.whatsappPrompts[0]}: [მიუთითეთ]`))
})

test('generic repair-request helper retains its original default and custom messages', () => {
  for (const [subject, expected] of [
    [undefined, 'გამარჯობა, მაინტერესებს ლეპტოპის შეკეთება.'],
    ['ლეპტოპის შეკეთების ღირებულება', 'გამარჯობა, მაინტერესებს ლეპტოპის შეკეთების ღირებულება.'],
  ]) {
    const url = new URL(laptopRequestUrl(subject))
    assert.equal(url.origin, 'https://wa.me')
    assert.equal(url.pathname, '/995591474040')
    assert.equal(url.searchParams.get('text'), expected)
    assert.doesNotMatch(url.searchParams.get('text'), /წყარო:|საიტზე ავირჩიე:/)
  }
})

test('built problem-panel WhatsApp action names the channel and preserves the selected screen draft', async () => {
  const built = await readFile(new URL('../dist/services/laptop-repair/index.html', import.meta.url), 'utf8')
  const panel = built.match(/<div\b[^>]*id="laptop-problem-panel"[\s\S]*?<\/section>/)?.[0]
  assert.ok(panel, 'Missing prerendered problem panel')
  assert.match(panel, /aria-labelledby="problem-tab-screen"/)
  const link = panel.match(/<a\b[^>]*class="[^"]*\blp-whatsapp-link\b[^"]*"[^>]*>[\s\S]*?<\/a>/)?.[0]
  assert.ok(link, 'Missing WhatsApp action inside the problem panel')
  assert.match(link, /მოგვწერეთ WhatsApp-ში/)
  assert.match(link, /<svg\b[^>]*aria-hidden="true"/)
  assert.match(link, /target="_blank"/)
  assert.match(link, /rel="[^"]*\bnoreferrer\b[^"]*"/)
  const screen = laptopProblems.find(problem => problem.id === 'screen')
  const href = link.match(/\bhref="([^"]+)"/)[1]
  assert.equal(href, laptopProblemRequestUrl(screen))
  const destination = new URL(href)
  assert.equal(destination.origin, 'https://wa.me')
  assert.equal(destination.pathname, '/995591474040')
  assert.equal(destination.searchParams.get('text'), laptopProblemMessage(screen))
})
