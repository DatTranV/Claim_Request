import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@components/ui/form";
import { Input } from "@components/ui/input";

interface FormInputProps {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  defaultValue?: string;
  props?: any;
  disabled?: boolean;
  value?: string;
}

export default function FormInput({
  label,
  name,
  className,
  placeholder,
  readOnly,
  defaultValue,
  disabled,
  value,
  ...props
}: FormInputProps) {
  const form = useFormContext();

  return (
    <>
      {/* <div className="form-control">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          placeholder={placeholder}
          {...register(name)} // Đăng ký input với React Hook Form
          aria-invalid={error ? "true" : "false"} // Cải thiện accessibility
          aria-describedby={error ? `${name}-error` : undefined} // Liên kết lỗi với input
          {...rest} // Truyền các props khác như type, placeholder, v.v.
        />
        {error && (
          <span id={`${name}-error`} className="error-message">
            {error.message}
          </span>
        )}
      </div> */}

      <FormField
        control={form.control}
        name={name}
        defaultValue={defaultValue}
        render={({ field }) => (
          <>
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <Input
                  id={name}
                  className={`w-full disabled:opacity-85 disabled:bg-gray-200 dark:disabled:bg-gray-800 ${className}`}
                  readOnly={readOnly}
                  {...field}
                  {...props}
                  placeholder={placeholder}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          </>
        )}
      />
    </>
  );
}
