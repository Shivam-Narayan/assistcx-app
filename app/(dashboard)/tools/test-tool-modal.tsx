import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InputSchemaData } from "./add-edit-tool-components/tool-interfaces";
import { PropertiesForm } from "./properties-form";
import { useAppSelector } from "@/redux/store";

interface TestToolModalProps {
  open: boolean;
  onClose: () => void;
  inputSchemaData?: InputSchemaData;
  id?: string;
}

export function TestToolModal({
  open,
  onClose,
  inputSchemaData,
  id,
}: TestToolModalProps) {
  const toolsData = useAppSelector(
    (state) => state?.toolsDataReducer?.toolsDataReducer?.value,
  );
  const handleClose = () => {
    onClose();
  };

  if (!inputSchemaData) {
    return null;
  }

  const schema = {
    input_schema: inputSchemaData,
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="flex flex-col max-w-[95vw] sm:max-w-2xl p-0 overflow-auto gap-2"
        onCloseAutoFocus={handleClose}
      >
        <PropertiesForm
          toolName={toolsData?.name}
          schema={schema}
          id={id}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
