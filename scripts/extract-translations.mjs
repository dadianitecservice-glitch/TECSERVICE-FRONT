import { readFile, readdir } from 'node:fs/promises'
import { parse } from '@babel/parser'

const georgian = /[\u10a0-\u10ff\u1c90-\u1cbf]/
export const normalize = value => value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('ka-GE')

export async function sourceFiles(directory = 'src') {
  const files = []
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${item.name}`
    if (item.isDirectory() && item.name !== 'i18n') files.push(...await sourceFiles(path))
    else if (/\.(ts|tsx)$/.test(item.name)) files.push(path)
  }
  return files
}

export async function extractTranslations() {
  const groups = { common: new Map(), devices: new Map(), specialist: new Map() }
  for (const file of await sourceFiles()) {
    const source = await readFile(file, 'utf8')
    const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    const group = /(?:laptopRepair|LaptopRepair|computerRepair|ComputerRepair|consoleRepair|ConsoleRepair)/.test(file) ? 'devices'
      : /(?:dataRecovery|DataRecovery|droneRepair|DroneRepair|mobileTabletRepair|MobileTabletRepair|otherElectronicsRepair|OtherElectronicsRepair)/.test(file) ? 'specialist' : 'common'
    const walk = node => {
      if (!node || typeof node !== 'object') return
      const value = node.type === 'StringLiteral' || node.type === 'JSXText' ? node.value : node.type === 'TemplateElement' ? node.value.cooked : null
      if (value && georgian.test(value)) {
        const key = normalize(value)
        if (key) groups[group].set(key, [...new Set([...(groups[group].get(key) ?? []), file])])
      }
      for (const [key, child] of Object.entries(node)) {
        if (['loc', 'extra', 'comments', 'tokens'].includes(key)) continue
        if (Array.isArray(child)) child.forEach(walk)
        else if (child && typeof child === 'object') walk(child)
      }
    }
    walk(ast.program)
  }
  return groups
}

if (process.argv[1]?.endsWith('extract-translations.mjs')) {
  const groups = await extractTranslations()
  const group = process.argv[2]
  if (group === '--catalog-patch') {
    const catalogs = { common: {}, devices: {}, recovery: {}, equipment: {} }
    for (const [name, entries] of Object.entries(groups)) {
      for (const [text, files] of entries) {
        const category = name === 'specialist' ? (files.some(file => /(?:dataRecovery|DataRecovery|droneRepair|DroneRepair)/.test(file)) ? 'recovery' : 'equipment') : name
        const id = `${category.slice(0, 3)}${String(Object.keys(catalogs[category]).length + 1).padStart(4, '0')}`
        catalogs[category][id] = text
      }
    }
    console.log('*** Begin Patch\n' + Object.entries(catalogs).map(([name, entries]) => `*** Add File: src/i18n/catalogs/${name}.ka.json\n` + JSON.stringify(entries, null, 2).split('\n').map(line => '+' + line).join('\n')).join('\n') + '\n*** End Patch')
    process.exit(0)
  }
  console.log(JSON.stringify(group ? Object.fromEntries(groups[group]) : Object.fromEntries(Object.entries(groups).map(([name, entries]) => [name, entries.size])), null, 2))
}
