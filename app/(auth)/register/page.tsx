import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <div className="container py-20 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Create your student account</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Guardian details are requested automatically for students under 18.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-brand font-medium hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
