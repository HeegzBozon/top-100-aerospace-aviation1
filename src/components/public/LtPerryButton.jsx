import React, { useState } from "react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * LtPerryButton
 * Floating action button that navigates to the Lt. Perry AI DM thread in Comms.
 */
export default function LtPerryButton() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    navigate(createPageUrl("Comms"));
    // Signal CommsLayout to open Perry DM
    window.dispatchEvent(
      new CustomEvent("openPerryDM", { detail: { open: true } })
    );
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Chat with Lt. Perry AI"
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center gap-2 h-12 rounded-full shadow-xl bg-[#1e3a5a] text-white border border-[#c9a87c]/30 overflow-hidden transition-all duration-300"
      style={{ width: hovered ? "auto" : "3rem", paddingLeft: hovered ? "1rem" : "0", paddingRight: hovered ? "1rem" : "0" }}
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      {hovered && (
        <span className="text-sm font-semibold whitespace-nowrap pr-1">
          Ask Lt. Perry
        </span>
      )}
    </motion.button>
  );
}