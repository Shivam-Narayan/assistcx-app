import React from "react";
import { tagColors } from "@/lib/constants";

interface ColorPickerProps {
  colors?: string[];
  onColorSelect: (color: string) => void;
  selectedColor?: string | null;
  onClose?: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors = tagColors,
  onColorSelect,
  selectedColor = null,
}) => {
  const handleColorClick = (color: string) => {
    onColorSelect(color);
  };

  return (
    <div className="bg-white rounded-lg p-2 ">
      <div
        className="grid grid-cols-6 gap-2 justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(colors.length / 2)}, 1fr)`,
        }}
      >
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorClick(color)}
            className={`cursor-pointer relative w-5 h-5 rounded-full transition-transform duration-200 hover:scale-110
              ${selectedColor === color ? "ring-2 ring-black" : ""}`}
            style={{
              backgroundColor: color,
              filter: "saturate(1.9) brightness(0.95)",
              border: selectedColor === color ? "none" : `2px solid ${color}`,
            }}
            title={color}
          >
            {selectedColor === color && (
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
