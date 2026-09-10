import test from 'node:test'
import assert from 'node:assert/strict'
import { assessDevice } from '../src/utils/assessment.ts'

test('safety signals take priority over routine overheating', () => {
  assert.equal(assessDevice('computers', 'ხურდება და კვამლი გამოდის').title, 'უსაფრთხოება პირველ ადგილზე')
})
test('data recovery never recommends writing or formatting', () => {
  const result = assessDevice('recovery', 'დისკი არ ჩანს')
  assert.equal(result.title, 'მონაცემების დაცვა')
  assert.match(result.steps[0], /ნუ დააფორმატებთ/)
})
test('recognizes heating and liquid symptoms', () => {
  assert.equal(assessDevice('consoles', 'კონსოლი ხურდება').title, 'გაგრილების სისტემის შემოწმება')
  assert.equal(assessDevice('computers', 'წყალი დაესხა').title, 'სითხით დაზიანების შესაძლო რისკი')
})
test('unknown descriptions ask for details instead of inventing diagnosis', () => {
  assert.equal(assessDevice('drones', 'რაღაც უჭირს').title, 'დამატებითი ინფორმაციაა საჭირო')
  assert.match(assessDevice('drones', 'რაღაც უჭირს').steps[0], /ნუ ააფრენთ/)
})

test('the actual screenshot prioritizes a broken screen, distinguishes no power and answers price intent honestly', () => {
  const result = assessDevice('computers', 'hp 15 g5 ეკრანი გამიტყდა და რა დაჯდება ამ ლეპტოპზე ეკრანის შეცვლა ? არ ირთვება')
  assert.equal(result.title, 'ეკრანის ფიზიკური დაზიანება')
  assert.match(result.explanation, /გამოსახულების არქონას.*ჩაურთველობას/)
  assert.match(result.steps.join(' '), /სრული მოდელი/)
  assert.match(result.steps.join(' '), /ინდიკატორი/)
  assert.match(result.steps.join(' '), /მიმდინარე ფასებს ვერ ამოწმებს/)
  assert.doesNotMatch(JSON.stringify(result), /\d+\s*(?:₾|ლარ)/)
})

test('hazards still override screen, price and no-power symptoms', () => {
  assert.equal(assessDevice('computers', 'ეკრანი გატეხილია, არ ირთვება და კვამლი გამოდის. რა ღირს?').title, 'უსაფრთხოება პირველ ადგილზე')
  assert.equal(assessDevice('computers', 'ეკრანი გამიტყდა და წყალი დაესხა').title, 'სითხით დაზიანების შესაძლო რისკი')
  assert.equal(assessDevice('computers', 'კვამლი არ აქვს მაგრამ ბატარეა გაბერილია').title, 'უსაფრთხოება პირველ ადგილზე')
  assert.equal(assessDevice('computers', 'კვამლი აღარ გამოდის, მაგრამ არ ირთვება').title, 'უსაფრთხოება პირველ ადგილზე')
})

test('simple negated heat, smoke and liquid symptoms do not override the actual fault', () => {
  for (const description of [
    'არ ხურდება, ეკრანი გამიტყდა',
    'კვამლი არ გამოდის, ეკრანი გატეხილია',
    'წყალი არ დასხმია, ეკრანი გატეხილია',
    'არ დასველებულა. ეკრანი გატეხილია',
    'screen cracked, no smoke, not overheating',
  ]) assert.equal(assessDevice('computers', description).title, 'ეკრანის ფიზიკური დაზიანება', description)
})

test('common symptoms produce distinct relevant responses', () => {
  const cases = [
    ['computers', 'არ ირთვება საერთოდ', 'კვების სისტემის შესაძლო პრობლემა'],
    ['computers', 'ლეპტოპი არ იტენება', 'დატენვისა და ბატარეის შემოწმება'],
    ['computers', 'ეკრანი შავია', 'ეკრანისა და გამოსახულების შემოწმება'],
    ['computers', 'ეკრანი არ მუშაობს', 'ეკრანისა და გამოსახულების შემოწმება'],
    ['computers', 'ეკრანი არ ირთვება', 'ეკრანისა და გამოსახულების შემოწმება'],
    ['computers', 'კლავიატურის ღილაკები არ მუშაობს', 'კლავიატურის პრობლემის დაზუსტება'],
    ['computers', 'ნელა მუშაობს და ჭედავს', 'მუშაობის შენელების შემოწმება'],
    ['computers', 'ფაილები წავშალე', 'მონაცემების დაცვა'],
    ['consoles', 'ჯოისტიკის ღილაკი არ მუშაობს', 'კონტროლერის პრობლემის დაზუსტება'],
    ['consoles', 'HDMI არ აჩვენებს გამოსახულებას', 'კონსოლის გამოსახულების შემოწმება'],
    ['drones', 'დრონი ჩამოვარდა და ძრავი არ ტრიალებს', 'დრონის უსაფრთხო შემოწმება'],
  ]
  for (const [device, description, title] of cases) assert.equal(assessDevice(device, description).title, title, description)
})

test('unrelated text and normal file mentions ask for clarification', () => {
  for (const description of ['', 'გამარჯობა', 'დღეს როგორი ამინდია?', 'ფაილები კარგად იხსნება', 'მითხარი რა ღირს', 'რა გემრიელი სტაფილოა']) {
    assert.equal(assessDevice('computers', description).title, 'დამატებითი ინფორმაციაა საჭირო', description)
  }
  assert.equal(assessDevice('recovery', 'გამარჯობა').title, 'დამატებითი ინფორმაციაა საჭირო')
  assert.match(assessDevice('computers', 'რა ღირს').steps.join(' '), /თანხას ვერ დაგისახელებთ/)
})
