// Follow static imports only. Preloading dynamicImports would download every
// page again and undo route splitting, including the private account bundle.
export function collectRouteAssets(manifest, entry) {
  const scripts = new Set()
  const styles = new Set()
  const visited = new Set()
  const visit = key => {
    if (visited.has(key)) return
    visited.add(key)
    const chunk = manifest[key]
    if (!chunk) throw new Error(`Missing build manifest entry: ${key}`)
    for (const dependency of chunk.imports ?? []) visit(dependency)
    if (chunk.file?.endsWith('.js')) scripts.add(chunk.file)
    for (const css of chunk.css ?? []) styles.add(css)
  }
  visit(entry)
  return { scripts: [...scripts], styles: [...styles] }
}

export function applyRouteAssets(html, manifest, entry) {
  const { scripts, styles } = collectRouteAssets(manifest, entry)
  const tags = [
    ...scripts.filter(file => !html.includes(`"/${file}"`)).map(file => `<link rel="modulepreload" crossorigin href="/${file}" />`),
    ...styles.filter(file => !html.includes(`"/${file}"`)).map(file => `<link rel="stylesheet" crossorigin href="/${file}" />`),
  ]
  return html.replace('</head>', `${tags.map(tag => `    ${tag}`).join('\n')}\n  </head>`)
}
