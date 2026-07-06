import './style.scss'
import { editor, Node } from 'typora'
import { decorate, I18n, openInputBox, Plugin } from '@typora-community-plugin/core'
import { reindex } from './features/indexer'
import { UseSuggest } from './features/use-suggest'

let mdNode: typeof Node
let mdNodeText = ''

export default class FootnotesPlugin extends Plugin {

  i18n = new I18n({
    resources: {
      'en': {
        reindexFootnotesCommand: 'Re-index numerical footnotes',
        reindexFootnotesStartMessage: 'Re-indexing the numerical footnotes...',
        reindexFootnotesEndMessage: 'Footnotes re-indexed!',
        addFootnotesDef: 'Add footnote description',
      },
      'zh-cn': {
        reindexFootnotesCommand: '重新编号数字脚注',
        reindexFootnotesStartMessage: '正在重新编号数字脚注……',
        reindexFootnotesEndMessage: '脚注重新编号完成！',
        addFootnotesDef: '添加脚注描述',
      },
    }
  })

  onload() {
    const { t } = this.i18n

    this.registerCommand({
      // XXX: extra prefix `footnote`
      id: 'footnote.reindex',
      title: t.reindexFootnotesCommand,
      scope: 'editor',
      callback: () => reindex(this.i18n),
    })

    this.registerCommand({
      id: 'add-def',
      title: t.addFootnotesDef,
      scope: 'editor',
      callback: () => {
        const $sup = $('.md-focus sup.md-expand')
        $sup.length && this.addDef($sup).then(() => editor.autoComplete.hide())
      },
    })

    this.register(
      this.addChild(new UseSuggest(this.app, this.i18n)))
  }

  addDef($sup: JQuery) {
    return openInputBox({ title: 'Add Footnote Defination' })
      .then(text => {
        if (!text) return
        this._injectContentToFootnoteDef()

        mdNodeText = text!
        editor.docMenu.addEmptyDef($sup.find('.md-text').text(), 'def_footnote')
      })
  }

  _injectContentToFootnoteDef() {
    if (mdNode) return
    mdNode = editor.nodeMap.allNodes.first()?.__proto__.constructor!

    this.register(
      decorate.parameters(mdNode.prototype, 'addAfter', ([node]) => {
        if (mdNodeText) {
          node.set('text', mdNodeText)
          mdNodeText = ''
        }
        return [node]
      }))
  }
}
