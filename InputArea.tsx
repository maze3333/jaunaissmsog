/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ArrowUpTrayIcon, SparklesIcon, CpuChipIcon, XMarkIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const CyclingText = () => {
    const words = [
        "a viral launch page",
        "a retro phone simulator",
        "a napkin sketch",
        "a chaotic whiteboard",
        "a game level design",
        "a sci-fi interface",
        "an ancient scroll"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // fade out
            setTimeout(() => {
                setIndex(prev => (prev + 1) % words.length);
                setFade(true); // fade in
            }, 500); // Wait for fade out
        }, 3000); // Slower cycle to read longer text
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <span className={`inline-block whitespace-nowrap transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-2 blur-sm'} text-white font-medium pb-1 border-b-2 border-blue-500/50`}>
            {words[index]}
        </span>
    );
};

export const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isGenerating, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  // Pre-filled prompt for the user's convenience
  const [prompt, setPrompt] = useState("Make a viral launch page for $OGSMS. Build a working phone simulator where the screen reads 'Merry Christmas'. Add a 'Copy CA' button that users find by typing on the keypad.");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert("Please upload an image or PDF.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
    }
  };

  // Paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || isGenerating) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
           e.preventDefault();
           handleFileSelect(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileSelect, disabled, isGenerating]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [disabled, isGenerating, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isGenerating) {
        setIsDragging(true);
    }
  }, [disabled, isGenerating]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = () => {
    if (!prompt.trim() && !selectedFile) return;
    onGenerate(prompt, selectedFile || undefined);
    // Reset after submit (optional, depending on UX preference. Keeping file might be useful for retrying)
    // setSelectedFile(null); 
    // setPrompt(''); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto perspective-1000">
      <div 
        className={`
            relative group transition-all duration-300
            bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-700
            ${isDragging ? 'border-blue-500 bg-zinc-900/50 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'hover:border-zinc-500'}
            ${isGenerating ? 'pointer-events-none opacity-50' : ''}
        `}
      >
            {/* Technical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl overflow-hidden" 
                 style={{backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px'}}>
            </div>
            
            {/* Corner Brackets */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 rounded-tl-xl transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 rounded-tr-xl transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 rounded-bl-xl transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 rounded-br-xl transition-colors duration-300 ${isDragging ? 'border-blue-500' : 'border-zinc-600'}`}></div>

            {/* Main Content Area */}
            <div className="flex flex-col">
                
                {/* Drop Zone / File Preview */}
                <div 
                    className={`
                        relative flex flex-col items-center justify-center
                        min-h-[160px] sm:min-h-[200px] p-6 cursor-pointer
                        transition-all duration-300
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={triggerFileSelect}
                >
                    {selectedFile ? (
                         <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 group/file">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-xl">
                                    {selectedFile.type.includes('pdf') ? (
                                        <DocumentIcon className="w-10 h-10 text-zinc-400" />
                                    ) : (
                                        <PhotoIcon className="w-10 h-10 text-zinc-400" />
                                    )}
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-transform hover:scale-110"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                            <span className="mt-3 text-zinc-200 font-medium text-sm px-3 py-1 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                                {selectedFile.name}
                            </span>
                            <span className="mt-2 text-blue-400 text-xs font-mono hover:underline">Click to change</span>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center text-center space-y-4">
                             <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 ${isDragging ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                                <div className={`absolute inset-0 rounded-2xl bg-zinc-800 border border-zinc-700 shadow-xl flex items-center justify-center ${isGenerating ? 'animate-pulse' : ''}`}>
                                    {isGenerating ? (
                                        <CpuChipIcon className="w-8 h-8 text-blue-400 animate-spin-slow" />
                                    ) : (
                                        <ArrowUpTrayIcon className={`w-8 h-8 text-zinc-300 transition-all duration-300 ${isDragging ? '-translate-y-1 text-blue-400' : ''}`} />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 flex flex-col sm:flex-row items-center gap-2">
                                    <span>Bring</span>
                                    <CyclingText />
                                    <span>to life</span>
                                </h3>
                                <p className="text-zinc-500 text-sm">Drag & drop, <span className="text-blue-400 font-medium">paste</span>, or click to upload</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Bar */}
                <div className="p-2 sm:p-4 border-t border-zinc-800 bg-zinc-900/30">
                    <div className="flex items-center gap-2 bg-zinc-950/50 border border-zinc-800 rounded-lg p-1.5 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-inner">
                        <input 
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={selectedFile ? "Add instructions... (e.g. 'Make it dark mode')" : "Describe what you want to build... (e.g. 'Launch page for $OGSMS')"}
                            className="flex-1 bg-transparent border-none text-sm sm:text-base text-zinc-200 placeholder-zinc-600 focus:ring-0 px-3 py-1.5 outline-none min-w-0"
                            disabled={isGenerating || disabled}
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={(!prompt.trim() && !selectedFile) || isGenerating || disabled}
                            className="
                                flex items-center gap-2 px-4 py-2 
                                bg-blue-600 hover:bg-blue-500 
                                disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed
                                text-white text-sm font-medium rounded-md 
                                transition-all duration-200
                                hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]
                                active:scale-95
                            "
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="hidden sm:inline">Building...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4" />
                                    <span>Generate</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={isGenerating || disabled}
            />
      </div>
    </div>
  );
};