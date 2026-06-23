import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Lightbulb, BookOpen, Paperclip, Globe } from "lucide-react";

const guidelines = [
  {
    icon: Globe,
    title: "Web Search",
    items: [
      "Web Search is enabled by default when no context is selected.",
      "Can also be used alongside a Knowledge Collection.",
    ],
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    items: [
      "Select a Knowledge Collection to search within your curated data.",
      "You can use Web Search together with Knowledge for broader results.",
    ],
  },
  {
    icon: Paperclip,
    title: "Files",
    items: [
      "Attach up to 5 files for the assistant to reference.",
      "Knowledge and Files are mutually exclusive — selecting one clears the other.",
    ],
  },
];

export function Guideline() {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-3xl mx-auto rounded-xl border bg-muted/30 overflow-hidden"
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="cursor-pointer text-left px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Guidelines</span>
              <span className="text-xs font-normal text-muted-foreground">
                Best practices for using the assistant
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-1">
          <div className="grid gap-3 sm:grid-cols-3">
            {guidelines.map((section) => (
              <div
                key={section.title}
                className="rounded-lg border bg-background p-3 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    {section.title}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-muted-foreground leading-relaxed flex gap-2"
                    >
                      <span className="text-muted-foreground/50 mt-px">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
