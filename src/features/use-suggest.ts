import { app, type App, Component, EditorSuggest } from "@typora-community-plugin/core"
import type FootnotesPlugin from "src/main"
import { editor, TRange } from "typora"


export class UseSuggest extends Component {

  constructor(private app: App, private i18n: FootnotesPlugin['i18n']) {
    super()
  }

  onload() {
    const { markdownEditor } = this.app.features

    this.register(
      markdownEditor.suggestion.register(new FootnotesActionSuggest(this.i18n)))

    this.register(
      markdownEditor.suggestion.register(new FootnotesSuggest()))
  }
}

enum TriggerType { EXTERNAL, INTERNAL, NO_MATCHED }

abstract class FootnotesBaseSuggest<T> extends EditorSuggest<T> {

  triggerText = '[^'

  protected triggerType: TriggerType = TriggerType.NO_MATCHED

  canTrigger(textBefore: string, textAfter: string, range: TRange) {
    if (textBefore.includes(this.triggerText)) {
      this.triggerType = TriggerType.EXTERNAL
      return true
    }
    if (range.containerNode.closest('.md-footnote')) {
      this.triggerType = TriggerType.INTERNAL
      return true
    }
    this.triggerType = TriggerType.NO_MATCHED
    return false
  }

  findQuery(textBefore: string, textAfter: string, range: TRange) {
    if (this.triggerType === TriggerType.EXTERNAL) {
      const matched = textBefore.match(/[\[【]\^([^\]]*)$/) ?? []
      return {
        isMatched: !!matched[0],
        query: matched[1],
      }
    }
    if (this.triggerType === TriggerType.INTERNAL) {
      return {
        isMatched: true,
        query: textBefore,
      }
    }
    return { isMatched: false }
  }

  lengthOfTextBeforeToBeReplaced(query: string) {
    if (this.triggerType === TriggerType.EXTERNAL)
      return query.length + this.triggerText.length
    else
      return query.length
  }
}

interface FootnoteDefination {
  ref: string
  text: string
}

class FootnotesSuggest extends FootnotesBaseSuggest<FootnoteDefination> {

  suggestions: FootnoteDefination[]

  getSuggestions(query: string) {
    this.suggestions = editor.nodeMap.foot_list._set
      .map(({ attributes: { ref, text } }) => ({ ref, text })) as FootnoteDefination[]

    if (!query) return this.suggestions

    return this.suggestions
      .filter(d => d.ref.toLowerCase().includes(query) || d.text.toLowerCase().includes(query))
  }

  getSuggestionId(suggest: FootnoteDefination) {
    return suggest.ref
  }

  renderSuggestion(suggest: FootnoteDefination) {
    const text = `[^${suggest.ref}]: ${suggest.text}`
    return `<span class="typ-footnote-suggest">${text}</span>`
  }

  getSuggestionById(id: string) {
    return this.suggestions.find(d => d.ref === id)!
  }

  beforeApply(suggest: FootnoteDefination) {
    if (this.triggerType === TriggerType.EXTERNAL)
      return `[^${suggest.ref}`
    else
      return suggest.ref
  }
}

interface FootnotesAction {
  label: string
  command: string
}

class FootnotesActionSuggest extends FootnotesBaseSuggest<FootnotesAction> {

  private _suggestions: FootnotesAction[]

  constructor(i18n: FootnotesPlugin['i18n']) {
    super()
    this._suggestions = [
      { command: 'typora-community-plugin.footnotes:add-def', label: i18n.t.addFootnotesDef },
    ]
  }

  getSuggestions(query: string): FootnotesAction[] {
    if (!query || editor.nodeMap.foot_list._set.find(f => f.attributes.ref === query)) return []
    return this._suggestions
  }

  getSuggestionId(suggest: FootnotesAction): string {
    return suggest.command
  }

  renderSuggestion(suggest: FootnotesAction) {
    return `<span class="typ-footnote-suggest">${suggest.label}</span>`
  }

  lengthOfTextBeforeToBeReplaced(query: string) {
    return 0
  }

  getSuggestionById(id: string): FootnotesAction {
    return this._suggestions.find(s => s.command === id)!
  }

  beforeApply(suggest: FootnotesAction): string {
    setTimeout(() => app.commands.run(suggest.command), 1000)
    return ''
  }
}
