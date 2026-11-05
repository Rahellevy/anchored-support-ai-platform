/** pluralize(1, 'conversation') → "1 conversation", pluralize(4, 'conversation') → "4 conversations" */
export const pluralize = (count: number, word: string): string => {
    return `${count} ${word}${count === 1 ? '' : 's'}`
}

/** initials('Jordan Avery') → "JA" */
export const initials = (name: string): string => {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0].toUpperCase())
        .slice(0, 2)
        .join('')
}
