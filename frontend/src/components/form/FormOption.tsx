import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { useFormContext } from "react-hook-form";
import { SelectValue } from "@radix-ui/react-select";

interface FormOptionProps {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  props?: any;
  options?: any;
  onChange?: any;
}

export default function FormOption({
  label,
  name,
  className,
  placeholder,
  options,
  onChange,
  ...props
}: FormOptionProps) {
  const form = useFormContext();

  return (
    // <>
    //   <Label htmlFor={name}>{label}</Label>
    //   <Select
    //     id={name}
    //     {...register(name)} // Đăng ký field với React Hook Form
    //     aria-invalid={error ? "true" : "false"} // Accessibility
    //     aria-describedby={error ? `${name}-error` : undefined} // Liên kết với lỗi
    //     {...rest} // Các props bổ sung như disabled, multiple, v.v.
    //   >
    //     {/* Render danh sách các option */}
    //     {initialValue && (
    //       <>
    //         <SelectItem value="" disabled hidden>
    //           {initialValue}
    //         </SelectItem>
    //       </>
    //     )}
    //     {items &&
    //       items.map((item) => (
    //         <option key={item.value} value={item.value}>
    //           {item.label}
    //         </option>
    //       ))}
    //   </Select>
    //   {error && (
    //     <span id={`${name}-error`} className="error-message">
    //       {error.message}
    //     </span>
    //   )}
    // </>
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                if (onChange) {
                  onChange(value);
                }
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    className={`w-full disabled:opacity-75 disabled:text-blue-500 dark:disabled:text-green-500 ${className}`}
                  >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options &&
                    options.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormItem>
          </>
        )}
      />
    </>
  );
}
