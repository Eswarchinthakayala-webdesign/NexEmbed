// src/components/ImageZoomModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ImageZoomModal = ({ isOpen, onClose, imageSrc, alt }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white hover:text-emerald-400"
          >
            <X size={32} />
          </button>

          {/* Zoomed Image */}
          <motion.img
            src={imageSrc}
            alt={alt}
            className="max-h-[90%] max-w-[90%] rounded-2xl shadow-2xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageZoomModal;
