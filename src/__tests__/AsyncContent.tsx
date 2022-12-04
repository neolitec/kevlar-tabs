import React, { useEffect, useRef, useState } from 'react'

const AsyncContent = () => {
  const [content, setContent] = useState<string | null>(null)
  const timeoutId = useRef<NodeJS.Timeout | number | null>(null)

  useEffect(() => {
    timeoutId.current = setTimeout(() => {
      setContent('Async content loaded')
    }, 1000)

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  return <div>{content ?? 'Loading...'}</div>
}

export default AsyncContent
