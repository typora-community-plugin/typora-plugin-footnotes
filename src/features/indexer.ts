const RE_REF = /\[\^(\d+)\](?!:)/g
const RE_REF_DEF = /(?:^|\r?\n)\[\^(\d+)\]: (.*)/g

// @ts-ignore
const newline = File.useCRLF ? '\r\n' : '\n'

export function reindex(md: string) {

  let count = 0
  const references = {} as Record<string, { id: string, newId: number; def: string }>

  md = md
    .replace(RE_REF, (_, id) => {
      if (!references[id]) {
        references[id] = { id, newId: ++count, def: '' }
      }
      return `[^${references[id].newId}]`
    })
    .replace(RE_REF_DEF, (_, id, def) => {
      if (references[id]) {
        references[id].def = def
      }
      else {
        references[id] = { id, newId: ++count, def }
      }
      return ''
    })
    .trimEnd()

  const referencesText = Object.values(references)
    .sort((a, b) => a.newId - b.newId)
    // @ts-ignore
    .map(ref => `${newline}[^${ref.newId}]: ${ref.def}`)
    .join('')

  return md + referencesText
}
