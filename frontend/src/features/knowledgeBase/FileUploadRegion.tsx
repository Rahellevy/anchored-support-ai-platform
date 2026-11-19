import React, { useState, useRef, type DragEvent, type ChangeEvent } from "react";

interface FileUploadProps {
    onFileSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
}

export const FileUploadRegion: React.FC<FileUploadProps> = ({onFileSelected, accept = '*', multiple = false}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0){
            const droppedFiles = Array.from(e.dataTransfer.files);
            onFileSelected(multiple ? droppedFiles : [droppedFiles[0]]);
            e.dataTransfer.clearData();
        }
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0){
            const selectedFiles = Array.from(e.target.files);
            onFileSelected(selectedFiles);
        }
    };
    
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }
    
    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{
                border: `2px dashed ${isDragging ? '#0070f3' : '#ccc'}`,
                backgroundColor: isDragging ? '#f0f8ff' : '#fafafa',
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                style={{ display: 'none'}}
            />
            <p style={{ margin: 0, fontWeight: 500}}>
                {isDragging 
                ? "Drop your file here..."
                : "Drag and drop file here, or click to select"}
            </p>
        </div>
    )
};