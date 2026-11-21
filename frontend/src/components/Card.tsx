import type { ReactNode } from 'react'
import styles from './Card.module.css'

/**
 * White rounded panel used for most content blocks.
 *   <Card>...</Card>                        div
 *   <Card as="article" className={...}>      pick the right HTML element; add extra classes
 */
interface CardProps {
  as?: 'div' | 'section' | 'article' | 'aside'
  className?: string
  children: ReactNode
  'aria-label'?: string
}

export function Card({ as: Tag = 'div', className, children, ...aria }: CardProps) {
  return (
    <Tag className={className ? `${styles.card} ${className}` : styles.card} {...aria}>
      {children}
    </Tag>
  )
}
