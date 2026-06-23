"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Markdown } from "@/components/ui/markdown";
import { ChevronDown, PencilIcon, Trash2 } from "lucide-react";

interface Props {
  guidelinesList: any[];
  isEditing: boolean;
  handleDeleteGuidelines: (index: number) => void;
  handleEditGuidelines: (index: number) => void;
  openIndexes: any;
  setOpenIndexes: any;
}

const GuidelinesList = ({
  guidelinesList,
  isEditing,
  handleEditGuidelines,
  handleDeleteGuidelines,
  openIndexes,
  setOpenIndexes,
}: Props) => {
  return (
    <>
      {(guidelinesList?.length ?? 0) > 0 &&
        guidelinesList?.map((skill, index) => {
          const isOpen = openIndexes.includes(index);
          return (
            <div key={index} className="py-4">
              <Card className="group overflow-hidden shadow-none p-0 gap-0 border">
                <CardHeader
                  onClick={() =>
                    setOpenIndexes((prev: any) =>
                      prev.includes(index)
                        ? prev.filter((i: any) => i !== index)
                        : [...prev, index],
                    )
                  }
                  className="cursor-pointer border-b bg-muted px-4 py-4! flex flex-row items-center justify-between space-y-0"
                >
                  <div className="font-semibold">
                    {skill.name || "Untitled Guideline"}
                  </div>

                  <div className="flex items-center gap-2 relative">
                    {isEditing && (
                      <div className="absolute right-8 bg-background border rounded-md shadow-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          className="cursor-pointer"
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGuidelines(index);
                          }}
                        >
                          <Trash2 size={18} />
                        </Button>

                        <Button
                          className="cursor-pointer"
                          type="button"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGuidelines(index);
                          }}
                        >
                          <PencilIcon size={18} />
                        </Button>
                      </div>
                    )}

                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="px-4 pt-2">
                    <Markdown size="sm">{skill.instructions}</Markdown>
                  </CardContent>
                )}
              </Card>
            </div>
          );
        })}
    </>
  );
};

export default GuidelinesList;
