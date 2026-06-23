"use client";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CreateAgentMenuCardProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  cardClassName?: string;
}
const CreateAgentMenuCard = ({
  onClick,
  icon,
  title,
  description,
  cardClassName,
}: CreateAgentMenuCardProps) => {
  return (
    <Card
      className={`group p-0 gap-0  break-words overflow-hidden hover:bg-primary/10 hover:text-primary hover:border-primary/30  cursor-pointer ${cardClassName}  hover:shadow-md 
        `}
      onClick={onClick}
    >
      <CardContent className="grid gap-6 px-4 !py-4">
        <div className="flex space-x-4 w-full min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 bg-muted  text-foreground/80  rounded-full  shrink-0 border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30
             
            
            `}
          >
            {icon}
          </div>
          <div className="w-full flex flex-col gap-2 min-w-0">
            {title && (
              <div className="flex flex-row items-center min-w-0">
                <div className="flex flex-row gap-2 items-center text-lg font-semibold leading-none min-w-0 flex-1">
                  <p
                    className={`text-lg font-medium leading-none text-foreground/90 break-words hyphens-auto min-w-0
                       `}
                  >
                    {title}
                  </p>
                </div>
                <ArrowRight
                  className={`w-5 h-5 text-foreground/80 shrink-0 opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out
                   
                  `}
                />
              </div>
            )}
            {description && (
              <p
                className={`text-sm text-muted-foreground break-words hyphens-auto
                
              `}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateAgentMenuCard;
