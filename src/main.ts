import './style.scss'
import { editor } from 'typora'
import { I18n, Notice, Plugin } from '@typora-community-plugin/core'
import { reindex } from './features/indexer'


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

    const { codeMasker, htmlMasker } = this.app.features.markdownEditor.preProcessor

    codeMasker.reset()
    htmlMasker.reset()

    try {
      let md = editor.getMarkdown()
      md = codeMasker.mask(md)
      md = htmlMasker.mask(md)

      md = reindex(md)

      md = htmlMasker.unmask(md)
      md = codeMasker.unmask(md)

      // @ts-ignore
      File.reloadContent(md, false, true, false, true)

      notice.close()
      new Notice(t.reindexFootnotesEndMessage)
    }
    catch (error) {
      notice.message = error.message
      console.error(error)
    }
  }
}
