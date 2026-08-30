import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopTitleBar } from './TopTitleBar'

interface AppLayoutProps {
  activePage: string
  onNavigate: (page: string) => void
  currentPage: ReactNode
  isLightTheme: boolean
  onOpenNewTransaction: () => void
  onToggleTheme: () => void
}

export function AppLayout({ activePage, onNavigate, currentPage, isLightTheme, onOpenNewTransaction, onToggleTheme }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const initialDevicePixelRatio = useRef(window.devicePixelRatio)
  const [titleBarMetrics, setTitleBarMetrics] = useState({ height: 44, controlsInset: 156 })
  const mainScrollRef = useRef<HTMLElement>(null)
  const scrollDragRef = useRef<{ pointerId: number; startY: number; startScrollTop: number } | null>(null)
  const [scrollIndicator, setScrollIndicator] = useState({ visible: false, height: 0, offset: 0, trackHeight: 0 })

  useEffect(() => {
    void window.electronAPI.invoke('set-window-theme', isLightTheme)
  }, [isLightTheme])

  useEffect(() => {
    const updateTitleBarMetrics = () => {
      const zoomCorrection = initialDevicePixelRatio.current / window.devicePixelRatio
      setTitleBarMetrics({
        height: Math.ceil(44 * zoomCorrection),
        controlsInset: Math.ceil(156 * zoomCorrection),
      })
    }

    updateTitleBarMetrics()
    window.addEventListener('resize', updateTitleBarMetrics)
    return () => window.removeEventListener('resize', updateTitleBarMetrics)
  }, [])

  useEffect(() => {
    const scroller = mainScrollRef.current
    if (!scroller) return

    const updateScrollIndicator = () => {
      const hasOverflow = scroller.scrollHeight > scroller.clientHeight + 1
      const trackHeight = Math.max(0, scroller.clientHeight - 24)
      const thumbHeight = hasOverflow ? Math.round(Math.min(trackHeight, Math.max(scroller.clientHeight * 0.12, 48))) : 0
      const travel = Math.max(0, trackHeight - thumbHeight)
      const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight)

      setScrollIndicator({
        visible: hasOverflow,
        height: thumbHeight,
        offset: Math.round((scroller.scrollTop / maxScroll) * travel),
        trackHeight,
      })
    }

    const resizeObserver = new ResizeObserver(updateScrollIndicator)
    const mutationObserver = new MutationObserver(updateScrollIndicator)

    resizeObserver.observe(scroller)
    if (scroller.firstElementChild) resizeObserver.observe(scroller.firstElementChild)
    mutationObserver.observe(scroller, { childList: true, subtree: true })
    scroller.addEventListener('scroll', updateScrollIndicator, { passive: true })
    updateScrollIndicator()

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      scroller.removeEventListener('scroll', updateScrollIndicator)
    }
  }, [titleBarMetrics.height])

  function beginScrollDrag(event: ReactPointerEvent<HTMLButtonElement>): void {
    const scroller = mainScrollRef.current
    if (!scroller) return

    event.currentTarget.setPointerCapture(event.pointerId)
    scrollDragRef.current = { pointerId: event.pointerId, startY: event.clientY, startScrollTop: scroller.scrollTop }
  }

  function dragScrollIndicator(event: ReactPointerEvent<HTMLButtonElement>): void {
    const scroller = mainScrollRef.current
    const drag = scrollDragRef.current
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return

    const thumbTravel = scrollIndicator.trackHeight - scrollIndicator.height
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    if (thumbTravel <= 0 || maxScroll <= 0) return

    scroller.scrollTop = drag.startScrollTop + ((event.clientY - drag.startY) / thumbTravel) * maxScroll
  }

  function endScrollDrag(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (scrollDragRef.current?.pointerId === event.pointerId) {
      scrollDragRef.current = null
    }
  }

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${isLightTheme ? 'bg-[#F4F4F5] text-[#18181B]' : 'bg-[#0A0A0C] text-white'}`}>
      <TopTitleBar title="Dashboard - Workspace: Local" isLightTheme={isLightTheme} onToggleTheme={onToggleTheme} {...titleBarMetrics} />
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => onNavigate(page)}
        isLightTheme={isLightTheme}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((value) => !value)}
        titleBarHeight={titleBarMetrics.height}
      />
      <main
        ref={mainScrollRef}
        style={{ height: `calc(100dvh - ${titleBarMetrics.height}px)`, marginTop: titleBarMetrics.height }}
        className={`page-scroll ml-16 min-w-0 overflow-y-auto overscroll-contain lg:ml-60 ${isLightTheme ? 'page-scroll-light' : 'page-scroll-dark'}`}
      >
        <div className="mx-auto max-w-[1440px] p-4 sm:p-6 lg:p-8">{currentPage}</div>
      </main>

      {scrollIndicator.visible && (
        <div
          aria-hidden="true"
          style={{ top: titleBarMetrics.height + 12, height: scrollIndicator.trackHeight }}
          className={`workspace-scroll-indicator ${isLightTheme ? 'workspace-scroll-indicator-light' : 'workspace-scroll-indicator-dark'}`}
        >
          <button
            type="button"
            tabIndex={-1}
            style={{ height: scrollIndicator.height, transform: `translateY(${scrollIndicator.offset}px)` }}
            className="workspace-scroll-thumb"
            onPointerDown={beginScrollDrag}
            onPointerMove={dragScrollIndicator}
            onPointerUp={endScrollDrag}
            onPointerCancel={endScrollDrag}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onOpenNewTransaction}
        className="sr-only"
        aria-label="Open new transaction form"
      >
        Open new transaction form
      </button>
    </div>
  )
}
