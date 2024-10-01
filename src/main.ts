import './style.scss'
import { editor } from 'typora'
import { I18n, Notice, Plugin } from '@typora-community-plugin/core'


const RE_REF = /\[\^(\d+)\]/g
const RE_REF_DEF = /\n\r?\[\^(\d+)\]: .+/g

export default class extends Plugin {

  i18n = new I18n({
    resources: {
      'en': {
        reindexFootnotesCommand: 'Re-index numerical footnotes',
        reindexFootnotesStartMessage: 'Re-indexing the numerical footnotes...',
        reindexFootnotesEndMessage: 'Footnotes re-indexed!',
      },
      'zh-cn': {
        reindexFootnotesCommand: '重新编号数字脚注',
        reindexFootnotesStartMessage: '正在重新编号数字脚注……',
        reindexFootnotesEndMessage: '脚注重新编号完成！',
      },
    }
  })

  onload() {
    this.registerCommand({
      id: 'footnote.reindex',
      title: this.i18n.t.reindexFootnotesCommand,
      scope: 'editor',
      callback: () => this.reindex(),
    })
  }

  reindex() {
    const { t } = this.i18n
    const notice = new Notice(t.reindexFootnotesStartMessage, 0)

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
    new Notice(t.reindexFootnotesEndMessage)
  }
}
