import './style.scss'
import { editor, Node } from 'typora'
import { decorate, I18n, openInputBox, path, Plugin } from '@typora-community-plugin/core'
import { reindex } from './features/indexer'
import { UseSuggest } from './features/use-suggest'
import * as Locale from './locales/lang.en.json'


let mdNode: typeof Node
let mdNodeText = ''

export default class FootnotesPlugin extends Plugin {

  i18n = new I18n<typeof Locale>({
    localePath: path.join(this.manifest.dir!, 'locales')
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
