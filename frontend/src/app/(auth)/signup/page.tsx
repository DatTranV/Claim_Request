"use client";
import AuthForm from "@/components/auth/AuthForm";
import { registerSchema } from "@/services/validiation/registerSchema";

export default function page() {
  return (
    <main>
      <div className="min-h-screen flex items-center justify-center bg-[url('/images/bg.jpg')] bg-cover bg-center">
        <AuthForm
          type="SIGNUP"
          schema={registerSchema}
          defaultValue={{
            email: "",
            password: "",
            fullName: "",
            username: "",
            phone: "",
          }}
        />
      </div>
    </main>
  );
}
