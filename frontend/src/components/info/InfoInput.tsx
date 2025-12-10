import { Label } from "@components/ui/label";
import { Input } from "../ui/input";

interface InfoInputProps {
  label: string;
  value?: string;
  className?: string;
  type?: string;
}

export default function InfoInput({ label, value, className, type }: InfoInputProps) {
  return (
    <>
      <div>
        <Label className="mb-2.5">{label}</Label>
        <Input readOnly type={type} className={`w-full ${className}`} defaultValue={value}/>
      </div>
    </>
  );
}
