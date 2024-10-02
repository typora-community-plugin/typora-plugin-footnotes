import { type App, Component, EditorSuggest } from "@typora-community-plugin/core"
import { editor, TRange } from "typora"


export class UseSuggest extends Component {

  constructor(private app: App) {
    super()
  }

  onload() {
    const { markdownEditor } = this.app.features

    const suggest = new FootnotesSuggest()

    this.register(
      markdownEditor.suggestion.register(suggest))
  }
}

type FootnoteDefination = {
  ref: string,
  text: string,
}

enum TriggerType { EMPTY, INTERNAL, NO_MATCHED }

class FootnotesSuggest extends EditorSuggest<FootnoteDefination> {

  triggerText = '[^'
  triggerType: TriggerType = TriggerType.NO_MATCHED

  suggestions: FootnoteDefination[]

  canTrigger(textBefore: string, textAfter: string, range: TRange) {
    if (textBefore.endsWith(this.triggerText)) {
      this.triggerType = TriggerType.EMPTY
      return true
    }
    if (range.containerNode.closest('.md-footnote')) {
      this.triggerType = TriggerType.INTERNAL
      return true
    }
    this.triggerType = TriggerType.NO_MATCHED
    return false
  }

  // @ts-ignore
  findQuery(textBefore: string, textAfter: string, range: TRange) {
    if (this.triggerType === TriggerType.EMPTY) {
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
    return {
      isMatched: false,
    }
  }

  getSuggestions(query: string) {
    this.suggestions = editor.nodeMap.foot_list._set
      .map(({ attributes: { ref, text } }) => ({ ref, text })) as FootnoteDefination[]

    if (!query)
      return this.suggestions
    else
      return this.suggestions.filter(d => {
        return d.ref.toLowerCase().includes(query) ||
          d.text.toLowerCase().includes(query)
      })
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
    if (this.triggerType === TriggerType.EMPTY)
      return `[^${suggest.ref}`
    else
      return suggest.ref
  }

  lengthOfTextBeforeToBeReplaced(query: string) {
    if (this.triggerType === TriggerType.EMPTY)
      return query.length + this.triggerText.length
    else
      return query.length
  }
}

