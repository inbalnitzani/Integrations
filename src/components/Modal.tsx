import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 ">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300">
        {/* Modal content */}
        {isOpen && (
          <>
            {title && (
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none"><XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-900" />
                </button>
              </div>
            )}
            {children}
          </>
        )}
      </div>
    </div>
  )
}

export default Modal 