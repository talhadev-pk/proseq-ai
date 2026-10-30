/** Convert the editor's HTML output to clean, readable Markdown. */

interface NodeCtx {
  listDepth: number
  ordered: boolean
  index: number
}

function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\s+/g, ' ')
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  const inner = Array.from(el.childNodes).map(inlineText).join('')
  switch (tag) {
    case 'strong':
    case 'b':
      return inner.trim() ? `**${inner}**` : ''
    case 'em':
    case 'i':
      return inner.trim() ? `*${inner}*` : ''
    case 'u':
      return inner
    case 'code':
      return `\`${inner}\``
    case 'br':
      return '\n'
    default:
      return inner
  }
}

function block(node: Node, ctx: NodeCtx): string {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    const text = (node.textContent ?? '').trim()
    return text ? `${text}\n\n` : ''
  }
  const el = node as HTMLElement
  const tag = el.tagName.toLowerCase()
  switch (tag) {
    case 'h1':
      return `# ${inlineText(el).trim()}\n\n`
    case 'h2':
      return `## ${inlineText(el).trim()}\n\n`
    case 'h3':
      return `### ${inlineText(el).trim()}\n\n`
    case 'h4':
    case 'h5':
    case 'h6':
      return `#### ${inlineText(el).trim()}\n\n`
    case 'p':
    case 'div': {
      if (el.querySelector('ul,ol')) {
        return Array.from(el.childNodes).map((c) => block(c, ctx)).join('')
      }
      const text = inlineText(el).trim()
      return text ? `${text}\n\n` : ''
    }
    case 'blockquote': {
      const inner = Array.from(el.childNodes)
        .map((c) => block(c, ctx))
        .join('')
        .trimEnd()
      return (
        inner
          .split('\n')
          .map((l) => `> ${l}`)
          .join('\n') + '\n\n'
      )
    }
    case 'ul':
    case 'ol': {
      const ordered = tag === 'ol'
      let out = ''
      let i = 1
      for (const child of Array.from(el.children)) {
        if (child.tagName.toLowerCase() !== 'li') continue
        const marker = ordered ? `${i}. ` : '- '
        const inner = inlineText(child).trim()
        out += `${'  '.repeat(ctx.listDepth)}${marker}${inner}\n`
        const nested = child.querySelector(':scope > ul, :scope > ol')
        if (nested) {
          out += block(nested, { ...ctx, listDepth: ctx.listDepth + 1, ordered, index: i })
        }
        i++
      }
      return out + '\n'
    }
    case 'hr':
      return '---\n\n'
    default:
      return Array.from(el.childNodes).map((c) => block(c, ctx)).join('')
  }
}

export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const out = Array.from(doc.body.childNodes)
    .map((n) => block(n, { listDepth: 0, ordered: false, index: 0 }))
    .join('')
  return out.replace(/\n{3,}/g, '\n\n').trim()
}
