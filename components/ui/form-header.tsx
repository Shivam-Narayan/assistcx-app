import { cn } from "@/lib/utils";

interface formTitleInterface {
  className?: string;
  title?: string;
  subtitle?: string;
  isRequired: boolean;
}

const FormHeaderHeading = ({
  className,
  title,
  subtitle,
  isRequired,
}: formTitleInterface) => {
  return (
    <>
      <h1 className={cn("text-2xl font-semibold", className)}>
        {title}
        {isRequired ? (
          <span className="text-destructive text-lg">&nbsp;*</span>
        ) : null}
      </h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </>
  );
};

export { FormHeaderHeading };
