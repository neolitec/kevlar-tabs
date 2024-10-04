import copy from 'copy-to-clipboard'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background-color: var(--code-background-color);
  padding: 0.5rem 0.8rem;
  border-radius: var(--radius-normal);
  color: var(--code-color);
  border: 2px solid var(--background1-color);
  box-shadow: 0 0 0 2px var(--border1-color);
  /* font-size: 1rem; */
  font-family: var(--font2);
`

const CopyButton = styled.button`
  display: contents;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  & > svg {
    height: 1.5rem;
    width: 1.5rem;
  }
`

interface CopyLineProps {
  copyValue: string
  text: string
}

export default function CopyLine({ copyValue, text }: CopyLineProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = useCallback(() => {
    copy(copyValue)
    setCopied(true)
    const delayId = setTimeout(() => setCopied(false), 2000)

    return () => {
      clearTimeout(delayId)
    }
  }, [copyValue])

  return (
    <Container>
      <span>{text}</span>
      <CopyButton onClick={handleClick} aria-label="Copy text">
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ stroke: 'var(--success-color)' }}
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </CopyButton>
    </Container>
  )
}
