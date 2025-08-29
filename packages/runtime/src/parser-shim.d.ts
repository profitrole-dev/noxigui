import type { UIElement } from '@noxigui/core'
import type { Renderer, RenderContainer } from './renderer.js'

declare module '@noxigui/parser' {
  class Parser {
    constructor(renderer: Renderer)
    parse(xml: string): { root: UIElement; container: RenderContainer }
  }
  export { Parser }
}
