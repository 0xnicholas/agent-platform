/**
 * 性能优化 Hooks
 */

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useDebounce - 防抖
 * 用于延迟更新值，减少频繁执行
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * useThrottle - 节流
 * 用于限制函数执行频率
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastUpdated = useRef<number>(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

/**
 * useIntersectionObserver - 懒加载观测器
 * 用于检测元素是否进入视口
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options.root, options.rootMargin, options.threshold])

  return [ref, isIntersecting]
}

/**
 * useLazyLoad - 懒加载 Hook
 * 当元素进入视口时加载数据
 */
export function useLazyLoad(loadMore: () => void, hasMore: boolean = true) {
  const [ref, isIntersecting] = useIntersectionObserver({
    rootMargin: '100px',
  })

  const isLoading = useRef(false)

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading.current) {
      isLoading.current = true
      Promise.resolve(loadMore()).finally(() => {
        isLoading.current = false
      })
    }
  }, [isIntersecting, hasMore, loadMore])

  return ref
}

/**
 * usePrevious - 上一次的值
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

/**
 * useToggle - 切换状态
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle, setValue]
}

/**
 * useLocalStorage - 本地存储
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

/**
 * useWindowSize - 窗口大小
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeout)
    }
  }, [])

  return size
}

/**
 * useMediaQuery - 媒体查询
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * useIsMobile - 是否移动端
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

/**
 * useIsTablet - 是否平板
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

/**
 * useIsDesktop - 是否桌面端
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}
