"use client";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import Color from "color";
interface ColorPickerContextValue {
  colors: string;
  setTempColor: (color: string) => void;
}

export default function AppThemeColorPicker({
  colors,
  setTempColor,
}: ColorPickerContextValue) {
  return (
    <ColorPicker
      color={colors}
      onChange={(value) => {
        const hex = Color(value).hex();
        setTempColor(hex);
      }}
      className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
    >
      <ColorPickerSelection className="min-h-40" />
      <div className="flex items-center gap-4">
        <ColorPickerEyeDropper />
        <div className="grid w-full gap-1">
          <ColorPickerHue />
          <ColorPickerAlpha />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ColorPickerOutput />
        <ColorPickerFormat />
      </div>
    </ColorPicker>
  );
}
