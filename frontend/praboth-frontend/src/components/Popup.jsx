import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Popup({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Popup;
