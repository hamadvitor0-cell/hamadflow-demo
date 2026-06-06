"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Field, Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginSchema, registerSchema } from "@/lib/validations";

export function LoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const {
    register,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "demo@hamadflow.dev", password: "demo123456" },
    mode: "onTouched",
  });

  return (
    <form action={action} className="mt-6 grid gap-4">
      <Field label="E-mail" hint={errors.email?.message}>
        <Input type="email" required {...register("email")} />
      </Field>
      <Field label="Senha" hint={errors.password?.message}>
        <Input type="password" required {...register("password")} />
      </Field>
      <SubmitButton>Entrar</SubmitButton>
    </form>
  );
}

export function RegisterForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const {
    register,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", brandName: "" },
    mode: "onTouched",
  });

  return (
    <form action={action} className="mt-6 grid gap-4">
      <Field label="Nome" hint={errors.name?.message}>
        <Input required {...register("name")} />
      </Field>
      <Field label="E-mail" hint={errors.email?.message}>
        <Input type="email" required {...register("email")} />
      </Field>
      <Field label="Senha" hint={errors.password?.message}>
        <Input type="password" minLength={8} required {...register("password")} />
      </Field>
      <Field label="Nome da marca ou empresa" hint={errors.brandName?.message}>
        <Input required {...register("brandName")} />
      </Field>
      <SubmitButton>Criar conta</SubmitButton>
    </form>
  );
}
