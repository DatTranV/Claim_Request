import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@components/ui/popover";
// import { Button } from "@components/ui/button";
// import { cn } from "@/lib/utils";
// import { format } from "date-fns";
// import { CalendarIcon } from "@heroicons/react/16/solid";
// import { Calendar } from "@components/ui/calendar";
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from "@/lib/utils";


interface DateRangePickerProps {
  label: string;
  name: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  props?: any;
  onChange?: any;
  disabled?: boolean;
}

export default function DateRangePicker({
  label,
  name,
  className,
  placeholder,
  readOnly,
  onChange,
  disabled,
  ...props
}: DateRangePickerProps) {
  const form = useFormContext();

  return (
    <>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <ReactDatePicker
              {...props}
              className={cn(
                "w-full rounded-md p-2 disabled:opacity-85 disabled:bg-gray-200 dark:disabled:bg-gray-800 ",
                className
              )}
              selectsRange
              startDate={field.value ? field.value[0] : null}
              endDate={field.value ? field.value[1] : null}
              placeholderText={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              onChange={(value) => {
                form.setValue(name, value);
                if (onChange) {
                  onChange(value);
                }
              }}
            />
          </FormItem>
        )}
      />
    </>
  );
}
