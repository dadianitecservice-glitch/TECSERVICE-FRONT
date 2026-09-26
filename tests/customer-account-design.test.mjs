import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { transformWithOxc } from 'vite'
import { dashboardCopy } from '../src/account/dashboardCopy.ts'
import { getCustomerServiceProgress } from '../src/account/serviceProgress.ts'

const root = new URL('../', import.meta.url)
const read = path => readFile(new URL(path, root), 'utf8')
const stageIds = ['received', 'in_service', 'ready', 'handed_over']
const expectedStages = {
  new: ['current', 'upcoming', 'upcoming', 'upcoming'],
  in_progress: ['complete', 'current', 'upcoming', 'upcoming'],
  waiting_for_part: ['complete', 'current', 'upcoming', 'upcoming'],
  ready: ['complete', 'complete', 'current', 'upcoming'],
  could_not_fix: ['complete', 'current', 'upcoming', 'upcoming'],
  picked_up: ['complete', 'complete', 'complete', 'complete'],
}
const georgian = /[\u10A0-\u10FF\u1C90-\u1CBF]/u

for (const locale of ['ka', 'en']) {
  test(`${locale} service progress accurately maps all six backend statuses`, () => {
    for (const [status, states] of Object.entries(expectedStages)) {
      const progress = getCustomerServiceProgress(status, locale)
      assert.equal(progress.known, true, status)
      assert.deepEqual(progress.milestones.map(stage => stage.id), stageIds, status)
      assert.deepEqual(progress.milestones.map(stage => stage.state), states, status)
      assert.equal(progress.milestones.filter(stage => stage.state === 'current').length, status === 'picked_up' ? 0 : 1, status)
      if (status === 'picked_up') assert.ok(progress.milestones.every(stage => stage.helperText === undefined), status)
      assert.equal(new Set(progress.milestones.map(stage => stage.label)).size, 4, status)
      assert.ok(progress.summary.title.trim(), status)
      assert.ok(progress.summary.description.trim(), status)
      for (const stage of progress.milestones) {
        assert.ok(stage.label.trim(), `${status}: ${stage.id}`)
        if (locale === 'en') assert.doesNotMatch(stage.label, georgian)
        else assert.match(stage.label, georgian)
      }
      if (locale === 'en') assert.doesNotMatch(JSON.stringify(progress), georgian)
    }
  })

  test(`${locale} unknown statuses never infer receipt, repair, readiness or completion`, () => {
    for (const status of ['', 'unknown', 'pending', 'diagnostics', 'completed', 'cancelled', 'NEW', 'ready ', '__proto__', 'constructor', 'toString']) {
      const progress = getCustomerServiceProgress(status, locale)
      assert.equal(progress.known, false, status)
      assert.deepEqual(progress.milestones.map(stage => stage.id), stageIds, status)
      assert.ok(progress.milestones.every(stage => stage.state === 'upcoming'), status)
      assert.ok(progress.summary.title.trim(), status)
    }
  })

  test(`${locale} supplied service resolution is preserved without inferring a new status`, () => {
    const resolution = '  Technician note: no successful repair; collected by customer.  '
    for (const status of Object.keys(expectedStages)) {
      const progress = getCustomerServiceProgress(status, locale, resolution)
      assert.equal(progress.summary.note, resolution.trim(), status)
      assert.deepEqual(progress.milestones.map(stage => stage.state), expectedStages[status], status)
    }
    for (const absent of [undefined, null, '', '   ']) {
      const progress = getCustomerServiceProgress('new', locale, absent)
      assert.notEqual(progress.summary.note, '   ')
      assert.deepEqual(progress.milestones.map(stage => stage.state), expectedStages.new)
    }
  })
}

test('Progress labels avoid invented diagnosis stages and successful-repair claims', () => {
  const inProgress = getCustomerServiceProgress('in_progress', 'en')
  assert.doesNotMatch(inProgress.milestones.map(stage => stage.label).join(' '), /diagnos|repaired|repair complete|repair successful/i)
  const waiting = getCustomerServiceProgress('waiting_for_part', 'en')
  assert.match(JSON.stringify(waiting.summary), /part/i)
  assert.match(JSON.stringify(waiting), /wait/i)
  const failed = getCustomerServiceProgress('could_not_fix', 'en')
  assert.match(JSON.stringify(failed.summary), /could not|unable|not repair/i)
  for (const id of ['ready', 'handed_over']) assert.equal(failed.milestones.find(stage => stage.id === id).state, 'upcoming')
  const collected = getCustomerServiceProgress('picked_up', 'en')
  assert.match(collected.summary.description, /handed over|collected/i)
  assert.doesNotMatch(JSON.stringify(collected), /successfully repaired|repair (?:is )?complete|repair succeeded/i)
})

test('Progress results cannot mutate the stage data returned for another record', () => {
  const first = getCustomerServiceProgress('ready', 'en')
  first.milestones[0].label = 'Changed only in the test'
  first.milestones[0].state = 'upcoming'
  const second = getCustomerServiceProgress('ready', 'en')
  assert.notEqual(second.milestones[0].label, first.milestones[0].label)
  assert.deepEqual(second.milestones.map(stage => stage.state), expectedStages.ready)
})

test('Georgian account purchase labels consistently use შესყიდვები', async () => {
  assert.equal(dashboardCopy.ka.purchases, 'ჩემი შესყიდვები')
  assert.equal(dashboardCopy.ka.purchaseCount, 'შესყიდვები')
  assert.match(dashboardCopy.ka.recentPurchases, /შესყიდვები/)
  assert.doesNotMatch(JSON.stringify(dashboardCopy.ka), /შენაძენ/u)
  const files = (await readdir(new URL('src/account/', root))).filter(file => /\.tsx?$/.test(file))
  for (const path of [...files.map(file => `src/account/${file}`), 'src/pages/AccountPage.tsx']) {
    assert.doesNotMatch(await read(path), /შენაძენ/u, path)
  }
})

test('Public and customer service views use the same milestone renderer', async () => {
  for (const path of ['src/components/TicketResult.tsx', 'src/account/CustomerTicketProgress.tsx']) {
    const source = await read(path)
    assert.match(source, /import\s+\{[^}]*TicketMilestones[^}]*\}\s+from\s+['"][^'"]*TicketMilestones['"]/, path)
    assert.match(source, /<TicketMilestones\b/, path)
    assert.doesNotMatch(source, /<ol\b[^>]*className="milestones"/, path)
  }
  assert.match(await read('src/account/CustomerServiceCard.tsx'), /<CustomerTicketProgress\b/)
  assert.match(await read('src/account/CustomerDashboard.tsx'), /<CustomerServiceCard\b/)
})

test('Customer milestones explicitly preserve four vertical marker-label steps across a mobile row', async () => {
  const css = await read('src/styles/account-dashboard.css')
  const scopedRule = selector => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rules = [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'g'))]
    assert.ok(rules.length, `Missing account-scoped rule: ${selector}`)
    return rules.map(([, declarations]) => declarations).join('\n')
  }
  const list = scopedRule('.account-service-progress .milestones')
  assert.match(list, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(list, /height:\s*auto/)
  const steps = scopedRule('.account-service-progress .milestones li')
  assert.match(steps, /flex-direction:\s*column/)
  assert.match(steps, /align-items:\s*center/)
  assert.match(steps, /min-width:\s*0/)
  assert.doesNotMatch(steps, /flex-direction:\s*row/)
  assert.match(scopedRule('.account-service-progress .milestones li i'), /display:\s*block/)
  assert.match(scopedRule('.account-service-progress .milestones li > span:not(.milestone-marker)'), /overflow-wrap:\s*anywhere/)
  assert.match(scopedRule('.account-record-grid--services'), /grid-template-columns:\s*minmax\(0,\s*1fr\)/)
})

// A pure TSX transform allows actual shared-component markup checks without a
// browser, Vite server, environment files, customer session or network request.
async function compileComponent(path, replacements = {}) {
  const source = await read(path)
  const { code } = await transformWithOxc(source, new URL(path, root).pathname, { jsx: { runtime: 'automatic' } })
  let executable = code.replaceAll('"react/jsx-runtime"', JSON.stringify(import.meta.resolve('react/jsx-runtime')))
  for (const [specifier, url] of Object.entries(replacements)) executable = executable.replaceAll(JSON.stringify(specifier), JSON.stringify(url))
  return `data:text/javascript;base64,${Buffer.from(executable).toString('base64')}`
}

const milestoneModuleUrl = await compileComponent('src/components/TicketMilestones.tsx')
const { TicketMilestones } = await import(milestoneModuleUrl)
const progressModuleUrl = await compileComponent('src/account/CustomerTicketProgress.tsx', {
  '../components/TicketMilestones': milestoneModuleUrl,
  './serviceProgress': new URL('src/account/serviceProgress.ts', root).href,
})
const { CustomerTicketProgress } = await import(progressModuleUrl)

for (const locale of ['ka', 'en']) {
  test(`${locale} shared milestone markup announces each state and uses checks only for confirmed steps`, () => {
    for (const status of [...Object.keys(expectedStages), 'unknown']) {
      const progress = getCustomerServiceProgress(status, locale)
      const html = renderToStaticMarkup(createElement(TicketMilestones, { milestones: progress.milestones, locale }))
      assert.match(html, /<ol\b[^>]*class="milestones"[^>]*aria-label="[^"]+"/)
      assert.equal((html.match(/<li\b/g) ?? []).length, 4, status)
      assert.equal((html.match(/aria-current="step"/g) ?? []).length, progress.known && status !== 'picked_up' ? 1 : 0, status)
      assert.equal((html.match(/<img\b/g) ?? []).length, progress.milestones.filter(stage => stage.state === 'complete').length, status)
      const items = [...html.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)].map(([item]) => item)
      for (const [index, stage] of progress.milestones.entries()) {
        assert.ok(items[index].includes(`aria-label="${stage.label} — `), `${status}: ${stage.id} needs an accessible state`)
        assert.match(items[index], /class="milestone-marker" aria-hidden="true"/)
        assert.equal(items[index].includes('is-complete'), stage.state === 'complete', `${status}: ${stage.id}`)
        assert.equal(items[index].includes('is-current'), stage.state === 'current', `${status}: ${stage.id}`)
      }
    }
  })

  test(`${locale} customer progress renders the supplied outcome and distinguishes unknown states`, () => {
    const resolution = 'Outcome recorded by the technician'
    const readyHtml = renderToStaticMarkup(createElement(CustomerTicketProgress, { status: 'ready', locale, resolution }))
    assert.match(readyHtml, /data-status="ready" data-known-status="true"/)
    assert.match(readyHtml, /class="status-summary"/)
    assert.ok(readyHtml.includes(`<small>${resolution}</small>`))
    const unknownHtml = renderToStaticMarkup(createElement(CustomerTicketProgress, { status: 'unmapped_state', locale }))
    assert.match(unknownHtml, /data-known-status="false"/)
    assert.doesNotMatch(unknownHtml, /is-complete|is-current|aria-current="step"|<img\b/)
  })
}

test('Status and outcome strings stay escaped text in the shared progress display', () => {
  const supplied = '<img src=x onerror=alert(1)>'
  const html = renderToStaticMarkup(createElement(CustomerTicketProgress, { status: supplied, locale: 'en', resolution: supplied }))
  assert.doesNotMatch(html, /<img\b|<script\b/)
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
})
