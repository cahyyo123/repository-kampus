import React, { useState, useRef } from 'react';
import { FileUp, X, FileText } from 'lucide-react';

interface FileDropzoneProps {
  label?: string;
  isRequired?: boolean;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  initialFileName?: string | null;
}

export default function FileDropzone({ label, isRequired = false, onFileSelect, accept = ".pdf,.mp4,.zip,.rar", initialFileName }: FileDropzoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>}
      <div 
        className={`mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition cursor-pointer relative ${
          isDragOver ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
          required={isRequired && !selectedFile && !initialFileName}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : initialFileName ? (
           <div className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-md shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-gray-800 truncate">{initialFileName}</span>
                <span className="text-xs text-indigo-500 mt-1 font-bold">Saat ini tersimpan</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-gray-500 underline self-center mr-2">Klik untuk ganti file</span>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                title="Hapus file ini"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-center">
            <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <div className="flex text-sm text-gray-600 justify-center">
              <span className="relative font-medium text-indigo-600 hover:text-indigo-500 px-2">
                Upload file, atau drag and drop
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 hover:text-gray-500">Maksimal 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
