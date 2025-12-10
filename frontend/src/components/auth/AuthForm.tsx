"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ZodType } from "zod";
import AuthLogo from "@components/auth/ui/AuthLogo";
import AuthFormInput from "@components/auth/ui/AuthFormInput";
import AuthFormForgetPassword from "@components/auth/ui/AuthFormForgetPassword";
import AuthFormSignUpOption from "@components/auth/ui/AuthFormSignUpOption";
import { FIELD_NAME, FIELD_TYPE } from "@/constants/authFieldList";
import AuthFormButton from "@components/auth/ui/AuthFormButton";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthFormProps {
  type?: "SIGNUP" | "SIGNIN";
  schema?: ZodType<LoginCredentials>;
  defaultValue?: LoginCredentials;
  onSubmit?: (data: LoginCredentials) => void;
}

export default function AuthForm({
  type,
  schema,
  defaultValue,
  onSubmit,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const form: UseFormReturn<LoginCredentials> = useForm<LoginCredentials>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: defaultValue,
  });

  const handleSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    if (type === "SIGNIN") {
      await login(data);
      const returnUrl = searchParams.get("returnUrl") || "/";
      document.cookie = `redirected=true; path=/`;
      router.push(returnUrl);
    };
  }
  return (
    <>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="relative px-4 py-10 bg-white/85 mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
            <div className="max-w-md mx-auto" style={{ minWidth: "320px" }}>
              <AuthLogo />
              <div className="mt-5">
                {defaultValue &&
                  Object.keys(defaultValue).map((field) => {
                    return (
                      <AuthFormInput
                        key={field}
                        label={FIELD_NAME[field as keyof typeof FIELD_NAME]}
                        type={FIELD_TYPE[field as keyof typeof FIELD_NAME]}
                        id={field}
                        register={form.register(field as keyof LoginCredentials)}
                        errors={form.formState.errors[field as keyof LoginCredentials]}
                      />
                    );
                  })}
              </div>
              <AuthFormForgetPassword />
              <div className="mt-5 w-full">
                <AuthFormButton
                  isLoading={form.formState.isSubmitting}
                  label={type === "SIGNUP" ? "Sign Up" : "Sign In"}
                  text={type === "SIGNUP" ? "Sign Up" : "Sign In"}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
