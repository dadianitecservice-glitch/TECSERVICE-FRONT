// One-time, syntax-aware migration to explicit React localization hooks.
import { readFile } from 'node:fs/promises'
import { parse } from '@babel/parser'
import { sourceFiles } from './extract-translations.mjs'

const patches = []
export const migratedSources = new Map()
const georgian = /[\u10a0-\u10ff\u1c90-\u1cbf]/
const textAttributes = new Set(['aria-label', 'title', 'alt', 'placeholder'])
for (const file of await sourceFiles()) {
  if (!/^src\/(components|sections|pages)\/.+\.tsx$/.test(file) || file.endsWith('/LaptopIcon.tsx')) continue
  const source = await readFile(file, 'utf8')
  if (source.includes("from '../i18n/LocaleProvider'")) continue
  const ast = parse(source, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  const edits = []
  const components = new Set()
  function wrap(node, method, component) {
    if (!node || node.type === 'JSXEmptyExpression') return
    edits.push([node.start, node.start, `l10n.${method}(`], [node.end, node.end, ')'])
    components.add(component)
  }
  function walk(node, parent, component) {
    if (!node || typeof node !== 'object') return
    if (node.type === 'FunctionDeclaration' && /^[A-Z]/.test(node.id?.name ?? '')) component = node
    if (component) {
      if (node.type === 'JSXText' && georgian.test(node.value)) {
        const lines = node.value.split(/\r\n|\n|\r/)
        const value = lines.map((line, i) => {
          let text = line.replace(/\t/g, ' ')
          if (i > 0) text = text.replace(/^ +/, '')
          if (i < lines.length - 1) text = text.replace(/ +$/, '')
          return text
        }).filter(Boolean).join(' ')
        edits.push([node.start, node.end, `{l10n.t(${JSON.stringify(value)})}`])
        components.add(component)
      }
      if (node.type === 'JSXExpressionContainer' && ['JSXElement', 'JSXFragment'].includes(parent?.type) && !['JSXElement', 'JSXFragment'].includes(node.expression.type)) wrap(node.expression, 't', component)
      if (node.type === 'JSXAttribute' && (textAttributes.has(node.name.name) || node.name.name === 'href')) {
        const method = node.name.name === 'href' ? 'href' : 't'
        if (node.value?.type === 'StringLiteral') {
          if (method === 'href' || georgian.test(node.value.value)) {
            edits.push([node.value.start, node.value.end, `{l10n.${method}(${JSON.stringify(node.value.value)})}`])
            components.add(component)
          }
        } else if (node.value?.type === 'JSXExpressionContainer') wrap(node.value.expression, method, component)
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (['loc', 'extra', 'comments', 'tokens'].includes(key)) continue
      if (Array.isArray(child)) child.forEach(item => walk(item, node, component))
      else if (child && typeof child === 'object') walk(child, node, component)
    }
  }
  walk(ast.program)
  if (!components.size) continue
  for (const component of components) edits.push([component.body.start + 1, component.body.start + 1, '\n  const l10n = useTranslation()'])
  let output = source
  for (const [start, end, text] of edits.sort((a, b) => b[0] - a[0] || b[1] - a[1])) output = output.slice(0, start) + text + output.slice(end)
  output = `import { useTranslation } from '../i18n/LocaleProvider'\n` + output
  // Parse every proposed file before offering a patch; no source files are written.
  parse(output, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  migratedSources.set(file, output)
  patches.push(`*** Update File: ${file}\n@@\n${source.trimEnd().split(/\r?\n/).map(line => '-' + line).join('\n')}\n${output.trimEnd().split(/\r?\n/).map(line => '+' + line).join('\n')}`)
}
if (process.argv[1]?.endsWith('localize-jsx.mjs')) console.log('*** Begin Patch\n' + patches.join('\n') + '\n*** End Patch')
