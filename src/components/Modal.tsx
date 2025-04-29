"use client";
import React, {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
                                         isOpen,
                                         onClose,
                                         title,
                                         children,
                                         className = '',
                                         showCloseButton = true,
                                         closeOnOutsideClick = true,
                                         closeOnEscape = true,
                                         size = 'md',
                                         footer
                                     }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle click outside
    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    // Add keyboard listener for Escape key
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = ''; // Restore scrolling
        };
    }, [isOpen, closeOnEscape, onClose]);

    // Size classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full m-4'
    };

    // If not open, don't render anything
    if (!isOpen) return null;

    // Render modal inside portal
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{backgroundColor: 'var(--background-modal)'}}
            onClick={handleOutsideClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div
                ref={modalRef}
                className={`w-full overflow-hidden rounded-xl shadow-2xl ${sizeClasses[size]} ${className}`}
                style={{
                    background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9), rgba(0, 0, 0, 0.9))',
                    borderColor: 'var(--border-primary)',
                    borderWidth: '1px',
                    backdropFilter: 'blur(8px)'
                }}
            >
                {/* Header */}
                {title && (
                    <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
                        <h2 id="modal-title" className="text-xl font-bold text-gray-100">
                            {title}
                        </h2>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="rounded-full p-1.5 bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20}/>
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={!title ? 'pt-4' : ''}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t border-gray-700/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default Modal;