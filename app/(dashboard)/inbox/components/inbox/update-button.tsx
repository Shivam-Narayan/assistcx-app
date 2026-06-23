import { Button } from "@/components/ui/button";

interface UpdateButtonProps {
  onUpdate: () => void;
  pendingCount: number;
}

export const UpdateButton = ({ onUpdate, pendingCount }: UpdateButtonProps) => {
  if (pendingCount === 0) return null;

  return (
    <div className="sticky top-0 z-10 w-full flex justify-center">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 z-20 pointer-events-auto">
        <Button onClick={onUpdate} className="rounded-full shadow-lg" size="lg">
          {pendingCount} New Request{pendingCount > 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
};
