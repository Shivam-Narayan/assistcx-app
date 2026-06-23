"use client";

interface ApiTypeRadioCardProps {
  id: string;
  value: string;
  label: string;
  form: any;
  userEvents: string;
  name?: string;
}

export default function ApiTypeRadioCard({
  id,
  value,
  label,
  form,
  userEvents,
  name = "api_type",
}: ApiTypeRadioCardProps) {
  const isSelected = form.watch(name) === value;
  const isView = userEvents === "viewTool";

  return (
    <div className="relative w-full">
      <input
        {...form.register(name)}
        id={id}
        type="radio"
        value={value}
        disabled={isView}
        className="peer hidden"
      />

      <span
        className={`absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 
          ${isSelected ? "border-primary" : "border-border"}
          ${isView ? "cursor-not-allowed" : "cursor-pointer"}`}
      ></span>

      <label
        htmlFor={id}
        onClick={() => {
          if (!isView) form.setValue(name, value);
        }}
        className={`
          flex flex-col rounded-lg border border-border p-4 peer-checked:border
          ${isSelected ? "bg-muted border-primary" : ""}
          ${isView ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
        `}
      >
        <span className="text-base font-semibold">{label}</span>
      </label>
    </div>
  );
}
