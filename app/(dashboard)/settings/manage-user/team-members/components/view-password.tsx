import { Eye, EyeOff } from "lucide-react";

interface ViewPasswordProps {
  passwordShow: any;
  setPasswordShow: any;
}

export const ViewPassword = ({
  passwordShow,
  setPasswordShow,
}: ViewPasswordProps) => {
  return (
    <div
      className="absolute right-0 p-2 cursor-pointer"
      onClick={(e) => {
        e.preventDefault();
        setPasswordShow(!passwordShow);
      }}
    >
      {!passwordShow ? <Eye size={20} /> : <EyeOff size={20} />}
    </div>
  );
};
