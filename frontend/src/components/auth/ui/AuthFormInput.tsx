import React from "react";

interface AuthFormInputProps {
  label: string;
  type: string;
  id: string;
  register?: any;
  errors?: any;
}

export default function AuthFormInput({
  label,
  type,
  id,
  register,
  errors,
}: AuthFormInputProps) {
  return (
    <div>
      <div className="flex flex-row justify-between">
        <label
          className="font-medium text-sm text-black-600 pb-1 block text-black"
          htmlFor={id}
        >
          {label}
        </label>
        {errors && (
          <p className="text-red-500 text-xs italic self-end mb-1.5">
            {errors.message}
          </p>
        )}
      </div>
      <input
        className="border border-gray-400 rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full text-black "
        type={type}
        id={id}
        {...register}
      />
    </div>
  );
}
