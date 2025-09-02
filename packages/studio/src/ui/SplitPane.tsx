import React from 'react'

export type SplitPaneProps = {
  left: React.ReactNode
  right: React.ReactNode
  /** Key used for localStorage persistence */
  storageKey: string
  /** Initial width in pixels for the left pane */
  defaultLeftWidth?: number
  /** Minimum width for the left pane */
  minLeftWidth?: number
  /** Additional className for container */
  className?: string
}

export function SplitPane({
  left,
  right,
  storageKey,
  defaultLeftWidth = 260,
  minLeftWidth = 150,
  className,
}: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) return parseInt(stored, 10)
      return defaultLeftWidth
    }
    return defaultLeftWidth
  })

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(leftWidth))
    }
  }, [leftWidth, storageKey])

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = leftWidth

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      const next = Math.max(minLeftWidth, startWidth + delta)
      setLeftWidth(next)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div className={["flex", className].filter(Boolean).join(" ")}>      
      <div
        style={{ width: leftWidth }}
        className="shrink-0 min-w-0 min-h-0 overflow-hidden"
      >
        {left}
      </div>
      <div
        className="w-1 h-full cursor-col-resize bg-[rgb(var(--cu-border))]"
        onMouseDown={startDrag}
      />
      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">{right}</div>
    </div>
  )
}
