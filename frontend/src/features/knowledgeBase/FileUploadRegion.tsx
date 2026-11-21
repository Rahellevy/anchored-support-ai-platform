import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'

interface FileUploadProps {
  onFileSelected: (files: File[]) => void
  /** e.g. ".txt,.md,.pdf,.docx". Only filters the file picker; the server checks the type too. */
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

/** Drop zone that also opens the file picker on click, Enter or Space. */
export function FileUploadRegion({ onFileSelected, accept = '*', multiple = false, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) onFileSelected(multiple ? droppedFiles : [droppedFiles[0]])
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? [])
    if (selectedFiles.length > 0) onFileSelected(selectedFiles)
    e.target.value = '' // so choosing the same file again still fires onChange
  }

  const openPicker = () => {
    if (!disabled) fileInputRef.current?.click()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openPicker()
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Choose a file to upload"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      style={{
        border: `2px dashed ${isDragging ? 'var(--color-plum)' : 'var(--color-border)'}`,
        backgroundColor: isDragging ? 'var(--color-blush)' : 'var(--color-surface)',
        borderRadius: 'var(--radius-small)',
        padding: '32px 20px',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        // the input is inside the drop zone, so its click would bubble up and open the picker twice
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'none' }}
        tabIndex={-1}
      />
      <p style={{ margin: 0, fontWeight: 500 }}>
        {isDragging ? 'Drop your file here…' : 'Drag and drop a file here, or click to choose one'}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {accept !== '*' && `Allowed: ${accept.split(',').join(', ')}`}
      </p>
    </div>
  )
}
