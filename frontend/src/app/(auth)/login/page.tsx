"use client";

import AuthForm from "@/components/auth/AuthForm";
import { loginSchema } from "@/services/validiation/loginSchema";

export default function page() {
  return (
    <main>
      <div className="min-h-screen flex items-center justify-center bg-[url('/images/bg.jpg')] bg-cover bg-center">
        <AuthForm 
            type="SIGNIN" 
            schema={loginSchema} 
            defaultValue={{
                email: "",
                password: "",
            }} 
        />
      </div>
    </main>
  );
}
