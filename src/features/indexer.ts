import { editor } from "typora"
import { Notice } from "@typora-community-plugin/core"


const RE_REF = /\[\^(\d+)\](?!:)/g
const RE_REF_DEF = /(?:^|\r?\n)\[\^(\d+)\]: (.*)/g

// @ts-ignore
const newline = File.useCRLF ? '\r\n' : '\n'

export function reindex() {
  const { t } = this.i18n
  const notice = new Notice(t.reindexFootnotesStartMessage, 0)

  const { codeMasker, htmlMasker } = this.app.features.markdownEditor.preProcessor

  codeMasker.reset()
  htmlMasker.reset()

  try {
    let md = editor.getMarkdown()
    md = codeMasker.mask(md)
    md = htmlMasker.mask(md)

    md = reindexMarkdown(md)

    md = htmlMasker.unmask(md)
    md = codeMasker.unmask(md)

    this.app.features.markdownEditor.setMarkdown(md)

    notice.close()
    new Notice(t.reindexFootnotesEndMessage)
  }
  catch (error) {
    console.error(error)
    notice
      .setMessage('[Footnotes] ' + error.message)
      .setCloseable(true)
  }
}

export function reindexMarkdown(md: string) {

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
