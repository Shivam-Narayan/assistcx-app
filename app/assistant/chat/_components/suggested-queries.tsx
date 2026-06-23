import { motion } from "framer-motion";
import { ChevronRight, MessageSquareText } from "lucide-react";
import React from "react";
import { SuggestedQueriesProps } from "./types";

const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquareText size={22} strokeWidth={1.5} />
        <h2 className=" text-lg font-semibold">Suggested Queries</h2>
      </div>
      <div className=" border-gray-200 flex flex-col gap-3  ">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion)}
            aria-label={`Suggestion ${index + 1}`}
            className="w-full px-4 py-3 flex items-center justify-between text-left border cursor-pointer hover:bg-gray-100 transition-colors rounded-lg"
          >
            <span className=" text-xs md:text-sm text-gray-700">
              {suggestion}
            </span>
            <ChevronRight className="size-4" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default SuggestedQueries;
