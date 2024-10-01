import './style.scss'
import { editor } from 'typora'
import { Notice, Plugin } from '@typora-community-plugin/core'


const RE_REF = /\[\^(\d+)\]/g
const RE_REF_DEF = /\n\r?\[\^(\d+)\]: .+/g

export default class extends Plugin {

  onload() {
    this.registerCommand({
      id: 'footnote.reindex',
      title: 'Footnote: Re-index numberical footnote references',
      scope: 'editor',
      callback: () => this.reindex(),
    })
  }

  reindex() {
    const notice = new Notice('Footnote re-indexing...', 0)

    const references = editor.nodeMap.foot_list._set.map(node => ({
      id: node.attributes.ref as string,
      newId: null,
      def: '',
    }))
      .reduce((o, ref) => (o[ref.id] = ref, o), {} as Record<string, any>)

    const { codeMasker, htmlMasker } = this.app.features.markdownEditor.preProcessor

    codeMasker.reset()
    htmlMasker.reset()

    let md = editor.getMarkdown()
    md = codeMasker.mask(md)
    md = htmlMasker.mask(md)

    let count = 0
    md = md.replace(RE_REF, (_, id) => {
      if (references[id]) {
        if (!references[id].newId) {
          references[id].newId = String(++count)
        }
        return `[^${references[id].newId}]`
      }
      return _
    })
      .replace(RE_REF_DEF, (_, id) => {
        if (references[id]) {
          references[id].def = _
          return ''
        }
        return _
      })
      .trimEnd()
      .concat(Object.values(references).map(ref => ref.def).join(''))

    md = htmlMasker.unmask(md)
    md = codeMasker.unmask(md)

    const sourceView = editor.sourceView
    const isSourceMode = sourceView.inSourceMode
    !isSourceMode && sourceView.show()
    sourceView.cm.setValue(md)
    !isSourceMode && sourceView.hide()

    notice.close()
    new Notice('Footnote re-indexing done.')
  }
}
