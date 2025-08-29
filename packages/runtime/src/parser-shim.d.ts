import type { UIElement } from '@noxigui/core'
import type { Renderer, RenderContainer } from './renderer.js'
import type { TemplateStore } from './template.js'

declare module '@noxigui/parser' {
  class Parser {
    constructor(renderer: Renderer, templates: TemplateStore)
    parse(xml: string): { root: UIElement; container: RenderContainer }
  }
  export { Parser }
}
