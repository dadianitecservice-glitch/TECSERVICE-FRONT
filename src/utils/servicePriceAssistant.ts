import { laptopPrices, formatLaptopPrice, laptopPriceDisclaimer } from '../data/laptopRepair.ts'
import { computerPrices, formatComputerPrice, computerPriceDisclaimer } from '../data/computerRepair.ts'
import { consolePrices, formatConsolePrice, consolePriceDisclaimer } from '../data/consoleRepair.ts'
import { dronePrices, formatDronePrice, dronePriceDisclaimer } from '../data/droneRepair.ts'
import { mobileTabletPrices, formatMobileTabletPrice, mobileTabletPriceDisclaimer } from '../data/mobileTabletRepair.ts'
import { dataRecoveryPrices, dataRecoveryPriceDisclaimer } from '../data/dataRecovery.ts'
import { otherElectronicsPrices, otherElectronicsPriceDisclaimer } from '../data/otherElectronicsRepair.ts'
import { assessDevice } from './assessment.ts'

export type ServicePriceAssessment = {
  reply: string
  assessment: {
    service: string
    labor_price: string
    estimated_duration: string
    price_note: string
    disclaimer: string
  } | null
  sources: { label: string; path: string }[]
}

type ServiceKind = 'laptop' | 'computer' | 'console' | 'drone' | 'mobile' | 'recovery' | 'electronics'
type PriceRow = { id: string; name: string; price: string; duration: string; note: string }
type Catalog = { label: string; path: string; disclaimer: string; prices: PriceRow[] }
type Match = [RegExp, string]

// The service pages and this offline preview use the same data and formatters.
// This intentionally has no assistant API, model, credentials, storage or uploads.
function getCatalogs(): Record<ServiceKind, Catalog> {
  return {
    laptop: { label: 'ლეპტოპები', path: '/services/laptop-repair/#laptop-prices', disclaimer: laptopPriceDisclaimer, prices: laptopPrices.map(p => ({ ...p, price: formatLaptopPrice(p), note: p.priceNote })) },
    computer: { label: 'კომპიუტერები', path: '/services/computer-repair/#computer-prices', disclaimer: computerPriceDisclaimer, prices: computerPrices.map(p => ({ ...p, price: formatComputerPrice(p), note: p.priceNote })) },
    console: { label: 'კონსოლები', path: '/services/console-repair/#console-prices', disclaimer: consolePriceDisclaimer, prices: consolePrices.map(p => ({ ...p, price: formatConsolePrice(p), note: p.priceNote })) },
    drone: { label: 'დრონები', path: '/services/drone-repair/#drone-prices', disclaimer: dronePriceDisclaimer, prices: dronePrices.map(p => ({ ...p, price: formatDronePrice(p), note: p.priceNote })) },
    mobile: { label: 'მობილურები / პლანშეტები', path: '/services/mobile-tablet-repair/#mobile-tablet-prices', disclaimer: mobileTabletPriceDisclaimer, prices: mobileTabletPrices.map(p => ({ ...p, price: formatMobileTabletPrice(p), note: p.priceNote })) },
    recovery: { label: 'ინფორმაციის აღდგენა', path: '/services/data-recovery/#data-recovery-prices', disclaimer: dataRecoveryPriceDisclaimer, prices: dataRecoveryPrices.map(p => ({ ...p, note: '' })) },
    electronics: { label: 'სხვა ელექტრონიკა', path: '/services/other-electronics/#other-electronics-prices', disclaimer: otherElectronicsPriceDisclaimer, prices: otherElectronicsPrices.map(p => ({ ...p, price: p.priceLabel, note: p.priceNote })) },
  }
}

const dataLoss = /(?:ფაილ|ფოტო|ინფორმაცი|მონაცემ).*(?:დაკარგ|წაიშალ|წავშალ|აღდგ)|(?:დაკარგ|წაიშალ|წავშალ).*(?:ფაილ|ფოტო|ინფორმაცი|მონაცემ)|დისკ.*(?:წკაპ|ტკაც)|\b(?:deleted|lost)\s+(?:files?|photos?|data)\b|\bdata recovery\b|\b(?:hdd|hard drive|disk|drive)\b[^.!?;\n]{0,50}\bclick(?:s|ing)?\b|\bclicking\s+(?:hdd|hard drive|disk|drive)\b/
const liquid = /დასველ|დაესხ|(?:სითხ|წყალ).*(?:მოხვ|დასხმ|გადაისხ)|\b(?:liquid damage|water damage|wet|spilled)\b/
const generalDiagnostics = /დიაგნოსტ|შემოწმ|არ ირთვ|ვერ ვრთ|ნელა|შენელ|იჭედ|იყინ|\b(?:diagnos\w*|inspection|no power|slow\w*|freez\w*)\b|won['’]?t turn|doesn['’]?t turn/

// Explicit negative statements must not trigger urgent guidance or price routing.
function positiveSymptoms(text: string) {
  return text
    // Strip only the healthy component clause, not adjacent hazards or no-power symptoms.
    .replace(/(?:ეკრან|დისპლე|მატრიც|კლავიატურ|ბატარე|ქულერ|თაჩპად)\p{L}*\s+(?:არ\s+(?:არის\s+)?(?:გატეხ|დაზიან|გაბზარ)\p{L}*|(?:გამართულ|დაუზიანებელ)\p{L}*|კარგად\s+მუშაობ\p{L}*)/gu, '')
    .replace(/\b(?:screen|display|keyboard|battery|fan|touchpad)\s+(?:(?:is|are)\s+)?(?:(?:not|isn't|aren't)\s+(?:broken|damaged|cracked)|fine|okay|ok|healthy|undamaged|intact|working normally|works fine|works normally)\b/gu, '')
    .replace(/\b(?:hdd|hard drive|disk|drive)\s+(?:(?:is not|isn't)\s+clicking|(?:does not|doesn't)\s+click)\b/gu, '')
    .replace(/(?:კვამლ\p{L}*|ნაპერწკ\p{L}*)\s+(?:და|ან)\s+(?:კვამლ\p{L}*|ნაპერწკ\p{L}*)\s+არ\s+(?:აქვს|არის|ჩანს|გამოდის)/gu, '')
    .replace(/(?:არ|აღარ)\s+(?:არის\s+)?(?:ხურდ\p{L}*|ცხელ\p{L}*|გადახურ\p{L}*|დასველ\p{L}*|გაბერ\p{L}*|შებერ\p{L}*)/gu, '')
    .replace(/(?:კვამლ\p{L}*|ნაპერწკ\p{L}*|გაბერ\p{L}*|შებერ\p{L}*)\s+არ\s+(?:აქვს|არის|ჩანს|გამოდის|ყოფილა|გამოსულა)/gu, '')
    .replace(/არ\s+(?:აქვს|არის|ჩანს|გამოდის)\s+(?:კვამლ\p{L}*|ნაპერწკ\p{L}*)/gu, '')
    .replace(/(?:წყალ\p{L}*|სითხ\p{L}*)\s+(?:არ|აღარ)\s+(?:დასხმ\p{L}*|დაესხ\p{L}*|მოხვედრ\p{L}*|მოხვდ\p{L}*)/gu, '')
    .replace(/(?:არ|აღარ)\s+(?:დასხმ\p{L}*|დაესხ\p{L}*|მოხვედრ\p{L}*|მოხვდ\p{L}*)\s+(?:წყალ\p{L}*|სითხ\p{L}*)/gu, '')
    .replace(/(?:ფაილ\p{L}*|მონაცემ\p{L}*|ფოტო\p{L}*)\s+არ\s+(?:წაშლ\p{L}*|დაკარგ\p{L}*|წაიშალ\p{L}*)/gu, '')
    .replace(/არ\s+(?:წავშალ\p{L}*|დამიკარგ\p{L}*)\s+(?:ფაილ\p{L}*|მონაცემ\p{L}*|ფოტო\p{L}*)/gu, '')
    .replace(/\b(?:no|without)\s+(?:smoke|sparks?)(?:\s+(?:or|and)\s+(?:smoke|sparks?))*\b/gu, '')
    .replace(/\b(?:no\s+(?:water|liquid)\s+(?:was\s+)?spilled|(?:water|liquid)\s+(?:was\s+)?not\s+spilled)\b/gu, '')
    .replace(/\b(?:no|without)\s+(?:smoke|sparks?|overheating|swollen battery|liquid damage|water damage|data loss)\b/gu, '')
    .replace(/\b(?:not|isn't|is not|aren't|are not)\s+(?:hot|overheating|swollen|wet|lost|deleted)\b/gu, '')
}

function detectKinds(text: string): ServiceKind[] {
  const patterns: [ServiceKind, RegExp][] = [
    ['laptop', /ლეპტოპ|ნოუთბუ|მაკბუ|\b(?:laptop|notebook|macbook|thinkpad|z[ -]?book)\b/],
    ['computer', /დესკტოპ|სტაციონარ|სისტემური ბლოკ|\b(?:desktop|pc|imac|tower)\b/],
    ['console', /კონსოლ|პლეისტეიშენ|იქსბოქს|ნინტენდო|ჯოისტიკ|გეიმპად|\b(?:console|playstation|ps[345]|xbox|nintendo|dualshock|dualsense)\b/],
    ['drone', /დრონ|გიმბალ|\b(?:drone|dji|fpv|gimbal|mavic)\b/],
    ['mobile', /ტელეფონ|მობილურ|სმარტფონ|პლანშეტ|აიფონ|აიპად|\b(?:phone|smartphone|tablet|iphone|ipad)\b/],
    ['electronics', /ტელევიზორ|პრინტერ|ინვერტორ|სტაბილიზატორ|სამრეწველო|სიგნალიზაცი|\b(?:tv|television|printer|ups|inverter|cnc|cctv|bms)\b/],
  ]
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([kind]) => kind)
}

const commonSoftware: Match[] = [
  [/დრაივერ|\bdrivers?\b/, 'drivers'],
  [/ბიოს|\b(?:bios|uefi)\b/, 'bios'],
  [/ოფის|\boffice\b/, 'office'],
  [/ფოტოშოპ|ილუსტრატორ|\b(?:photoshop|illustrator|3ds\s*max)\b|პროგრამ.*(?:დაყენ|ინსტალ)/, 'programs'],
  [/ჩატვირთ|\bboot\w*\b/, 'boot'],
  [/ვინდოუს|ვინდოუსი|\bwindows\b/, 'windows'],
  [/სარეზერვო|ფაილ.*გადატან|\b(?:backup|file transfer)\b/, 'backup'],
]

const rules: Record<ServiceKind, Match[]> = {
  laptop: [
    [/ეკრან|მატრიც|დისპლე|\b(?:screen|display)\b/, 'screen'],
    [/კლავიატურ|\bkeyboard\b/, 'keyboard'],
    [/ბატარე.*(?:შეცვლ|გამოცვლ)|(?:შეცვლ|გამოცვლ).*ბატარე|\bbattery\b.*\breplac|\breplac\w*\b.*\bbattery\b/, 'battery'],
    [/ანჯამ|კორპუს|\b(?:hinge|chassis)\b/, 'hinges'],
    [/პორტ|\b(?:usb|hdmi|port)\b/, 'ports'],
    [/თაჩპად|\btouchpad\b/, 'touchpad'],
    [/ქულერ.*(?:შეცვლ|გამოცვლ)|\bfan replacement\b/, 'fan'],
    [/წმენდ|თერმო|თერმულ|გადახურ|ხურდ|ცხელ|\b(?:clean\w*|thermal|overheat\w*)\b/, 'cooling'],
    [/\b(?:wi-?fi|bluetooth)\b/, 'wireless'],
    [/\b(?:ssd|nvme)\b.*(?:მონტაჟ|შეცვლ|დაყენ|install|upgrad|replac)/, 'ssd'],
    [/ოპერატიულ|\bram\b/, 'ram'],
    [/პლატ|კვების სისტემა|\bmotherboard\b/, 'board'],
    ...commonSoftware,
  ],
  computer: [
    [/ვიდეოკარტ.*შეკეთ|\bgpu\b.*\brepair\b/, 'gpu-repair'],
    [/ვიდეოკარტ|\bgpu\b/, 'gpu-diagnostics'],
    [/კვების ბლოკ.*(?:შეცვლ|გამოცვლ)|\bpsu\b.*replac/, 'psu'],
    [/დედაპლატ|\bmotherboard\b/, 'board'],
    [/ქულერ.*(?:შეცვლ|მონტაჟ)|\bcooler\b/, 'cooler'],
    [/წმენდ|თერმო|თერმულ|გადახურ|ხურდ|ცხელ|\b(?:clean\w*|thermal|overheat\w*)\b/, 'cleaning'],
    [/\b(?:ssd|hdd|nvme)\b.*(?:მონტაჟ|შეცვლ|დაყენ|install|upgrad|replac)/, 'storage'],
    [/ოპერატიულ|\bram\b/, 'ram'],
    [/პორტ|\b(?:usb|lan|port)\b/, 'ports'],
    ...commonSoftware.map(([pattern, id]): Match => [pattern, id === 'boot' ? 'boot-repair' : id]),
  ],
  console: [
    [/კონტროლერ.*(?:ბატარე|დატენ|იტენ)|\bcontroller\b.*\b(?:battery|charg\w*)\b/, 'controller-power'],
    [/ჯოისტიკ|კონტროლერ|გეიმპად|დრიფტ|\b(?:controller|gamepad|drift|dualshock|dualsense)\b/, 'controller'],
    [/\b(?:usb-?c|usbc)\b.*switch|switch.*\b(?:usb-?c|usbc)\b/, 'switch-usb-c'],
    [/\bhdmi\b/, 'hdmi'],
    [/წმენდ|თერმო|გადახურ|ხურდ|ცხელ|\b(?:clean\w*|thermal|overheat\w*)\b/, 'cleaning'],
    [/ქულერ|დისკ.?დრაივ|\b(?:fan|disc drive)\b/, 'fan-disc'],
    [/კვების ბლოკ|კვების ჯაჭვ|\bpower supply\b/, 'power'],
    [/პლატ|\bmotherboard\b/, 'board'],
    [/\b(?:wi-?fi|bluetooth)\b/, 'wireless'],
    [/მეხსიერ|პროგრამულ|\b(?:ssd|storage|software)\b/, 'storage'],
  ],
  drone: [
    [liquid, 'board-water'],
    [/პლატ|\b(?:esc|fc)\b/, 'board-water'],
    [/გიმბალ|კამერ|\b(?:camera|gimbal)\b/, 'camera-gimbal'],
    [/ძრავ|მოტორ|\bmotor\b/, 'motor-esc'],
    [/მკლავ|კორპუს|\b(?:arm|body)\b/, 'arm-body'],
    [/კალიბრ|\b(?:calibrat\w*|imu|compass|gps)\b/, 'calibration'],
    [/\b(?:firmware|flysafe)\b|აპ.*კავშირ/, 'firmware'],
    [/ჩამოვარდ|დავარდ|დაეცა|შეჯახ|\bcrash\w*\b/, 'crash-check'],
  ],
  mobile: [
    [liquid, 'liquid'],
    [/ეკრან|დისპლე|სენსორ|\b(?:screen|display|touch)\b/, 'screen-touch'],
    [/ბატარე.*(?:შეცვლ|გამოცვლ)|\bbattery\b.*replac|replac\w*.*\bbattery\b/, 'battery'],
    [/პორტ|კონექტორ|\b(?:port|usb-?c|lightning)\b/, 'charging-port'],
    [/კამერ|დინამიკ|მიკროფონ|\b(?:camera|speaker|microphone)\b/, 'camera-audio'],
    [/პლატ|\bmotherboard\b/, 'board'],
    [/პროგრამულ|მიგრაცი|\b(?:software|migration)\b/, 'software'],
  ],
  recovery: [
    [/დონორ|\bdonor\b/, 'donor'],
    [/\b(?:raid|nas)\b/, 'raid'],
    [/წკაპ|ტკაც|მექანიკ|თავაკ|\b(?:click\w*|mechanical|heads?)\b/, 'mechanical'],
    [/წაშლ|წაიშალ|წავშალ|დაფორმატ|\b(?:delet\w*|format\w*)\b/, 'logical'],
    [/\b(?:ssd|nvme)\b.*(?:კონტროლ|firmware)|(?:კონტროლ|firmware).*\b(?:ssd|nvme)\b/, 'ssd'],
    [/\b(?:usb|flash|sd)\b|ფლეშ|ფლეშკ|ბარათ/, 'flash'],
    [/იმიჯინგ|არასტაბილურ|\b(?:imaging|unstable)\b/, 'imaging'],
    [/სტანდარტულ.*დიაგნოსტ|\bstandard diagnos/, 'standard-diagnostics'],
    [/ლაბორატორ|დიაგნოსტ|\blab\w*\b|\bdiagnos/, 'diagnostics'],
    [/დისკ.*(?:არ ჩანს|აღარ ჩანს)|\b(?:ssd|nvme|hdd|drive)\b/, 'diagnostics'],
  ],
  electronics: [
    [/\b(?:ups|inverter)\b|ინვერტორ|სტაბილიზატორ|უწყვეტ/, 'ups-inverter'],
    [/\b(?:cnc|laser)\b|სამრეწველო|ლაზერ/, 'industrial-control'],
    [/\bbms\b|დამტენ.*(?:სადგურ|შეკეთ)|\bcharger\b/, 'charger-bms'],
    [/\b(?:cctv|security|alarm)\b|სიგნალიზაცი|დაშვების კონტროლ/, 'security'],
    [/ტელევიზორ.*(?:განათებ|backlight|led)|\b(?:tv|television)\b.*\b(?:backlight|led)\b/, 'tv-backlight'],
    [/ტელევიზორ.*პლატ|\b(?:tv|television)\b.*\b(?:board|power supply)\b/, 'tv-board'],
    [/პრინტერ.*პლატ|აუდიო.*პლატ|\b(?:printer|audio)\b.*\bboard\b/, 'consumer-boards'],
    [/კვების ბლოკ|კვების ჯაჭვ|\bpower supply\b/, 'power-supply'],
    [/სპეციალურ.*შეკეთ|\bspecial equipment\b/, 'special'],
  ],
}

/** Offline catalog guidance only; symptoms never establish a diagnosis or full quote. */
export function getServicePriceAssessment(device: string, description: string, locale: 'ka' | 'en', t: (value: string) => string): ServicePriceAssessment {
  const choose = (ka: string, en: string) => locale === 'ka' ? ka : en
  const text = positiveSymptoms(description.trim().toLocaleLowerCase().normalize('NFKC'))
  const detected = detectKinds(text)
  const safety = assessDevice(detected.includes('drone') ? 'drones' : device, text).title
  let warning = ''
  if (safety === 'უსაფრთხოება პირველ ადგილზე') warning = choose('შეწყვიტეთ გამოყენება და დატენვა; არ გახვრიტოთ ბატარეა და რისკისას მოწყობილობას ნუ შეეხებით. ხანძრის შემთხვევაში დარეკეთ 112-ზე.', 'Stop using and charging the device; do not puncture the battery or touch the device if unsafe. In a fire, call 112.')
  else if (liquid.test(text)) warning = choose('არ ჩართოთ და არ დატენოთ დასველებული მოწყობილობა; არ გამოიყენოთ ფენი. საჭიროა სპეციალისტის შემოწმება.', 'Do not turn on or charge a wet device and do not use a hairdryer. Have it inspected by a specialist.')
  else if (dataLoss.test(text) || device === 'recovery') warning = choose('არ ჩაწეროთ ახალი ფაილები დაზიანებულ მატარებელზე და არ დააფორმატოთ. უცნაური ხმისას შეწყვიტეთ გამოყენება; აღდგენის შედეგი გარანტირებული არ არის.', 'Do not write new files to the affected storage or format it. Stop using it if it makes unusual noises; recovery is not guaranteed.')
  else if (safety === 'დრონის უსაფრთხო შემოწმება') warning = choose('არ ააფრინოთ დრონი შემოწმებამდე და არ სცადოთ ძრავების გამოცდა ხელში დაჭერით. მიუთითეთ მოდელი, დაცემის ისტორია და აპლიკაციაში ნაჩვენები შეცდომა.', 'Do not fly the drone before inspection or test its motors while holding it in your hand. Provide the model, crash history and any error shown in the app.')

  const catalogs = getCatalogs()
  // The UI applies its locale-aware href helper, just as for other internal links.
  const source = (kind: ServiceKind) => ({ label: t(catalogs[kind].label), path: catalogs[kind].path })
  const clarify = (ka: string, en: string, kinds: ServiceKind[] = []): ServicePriceAssessment => ({ reply: [warning, choose(ka, en)].filter(Boolean).join('\n\n'), assessment: null, sources: kinds.map(source) })
  const selected: Record<string, ServiceKind> = { laptops: 'laptop', laptop: 'laptop', desktop: 'computer', consoles: 'console', drones: 'drone', recovery: 'recovery', 'data-recovery': 'recovery', mobile: 'mobile', 'mobile-tablets': 'mobile', electronics: 'electronics' }
  const isRecovery = dataLoss.test(text) || device === 'recovery' || device === 'data-recovery'
  const kind: ServiceKind | undefined = isRecovery ? 'recovery' : detected.length === 1 ? detected[0] : selected[device]
  if (detected.length > 1 && !isRecovery) return clarify('რომელი ერთი მოწყობილობის მომსახურება გაინტერესებთ? მიუთითეთ მისი ტიპი, მოდელი და მთავარი პრობლემა.', 'Which one device would you like help with? Please specify its type, model and main problem.', detected)
  if (!kind && device === 'computers') return clarify('ლეპტოპია თუ დესკტოპ კომპიუტერი? მიუთითეთ მოდელი და სასურველი მომსახურება ან პრობლემა, რადგან მათი ფასები განსხვავდება.', 'Is it a laptop or a desktop computer? Please specify the model and the service or problem, as their prices differ.', ['laptop', 'computer'])
  if (!kind) return clarify('რომელი მოწყობილობაა — მობილური/პლანშეტი თუ სხვა ელექტრონიკა? მიუთითეთ ზუსტი ტიპი, მოდელი და პრობლემა.', 'Which device is it — a phone/tablet or another electronic device? Please specify its exact type, model and problem.', device === 'other' ? ['mobile', 'electronics'] : [])

  const catalog = catalogs[kind]
  let priceId = rules[kind].find(([pattern]) => pattern.test(text))?.[1]
  // Generic symptoms get a diagnostic service, never an assumed part replacement.
  const hasSafetySignal = safety === 'უსაფრთხოება პირველ ადგილზე' || liquid.test(text) || dataLoss.test(text)
  if (!priceId && (generalDiagnostics.test(text) || /არ იტენ|არ ტენ|\bnot charg/.test(text) || hasSafetySignal)) priceId = 'diagnostics'
  if (!priceId) return clarify('რომელი მომსახურება ან სიმპტომი გაინტერესებთ? მიუთითეთ ზუსტი მოდელი და მოკლე აღწერა — კონკრეტული სამუშაოს გარეშე ფასს ვერ შევარჩევ.', 'Which service or symptom would you like help with? Please provide the exact model and a short description so I can select the relevant listed service.', [kind])
  const row = catalog.prices.find(price => price.id === priceId)
  if (!row) return clarify('ამ სამუშაოს ცალკე ფასი გვერდზე მითითებული არ არის. მიუთითეთ მოდელი და დაუკავშირდით სერვისს ღირებულების დასაზუსტებლად.', 'A separate price for this task is not listed on the page. Please provide the model and contact the service team to confirm the cost.', [kind])
  const disclaimer = [t(catalog.disclaimer), choose('ეს ასისტენტის საორიენტაციო პასუხია, არა დიაგნოზი ან სრული შეთავაზება. სამუშაოს საჭიროება, საბოლოო ფასი და ვადა შემოწმების შემდეგ თანხმდება.', 'This is guidance from the assistant, not a diagnosis or a full quotation. The required work, final cost and timing must be agreed after inspection.')].join(' ')
  return {
    reply: [warning, choose('შესაბამისი სერვისის გვერდზე ამ სამუშაოს ფასი ასეა მითითებული. მხოლოდ აღწერა არ ადასტურებს, რომ სწორედ ეს სამუშაო გჭირდებათ; დასაზუსტებლად საჭიროა ზუსტი მოდელი და შემოწმება.', 'The relevant service page lists the following price for this work. Your description alone does not confirm that this work is needed; the exact model and inspection are required.')].filter(Boolean).join('\n\n'),
    assessment: { service: t(row.name), labor_price: t(row.price), estimated_duration: t(row.duration), price_note: t(row.note), disclaimer },
    sources: [source(kind)],
  }
}
