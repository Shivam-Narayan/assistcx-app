import React, { Suspense, lazy } from "react";
import Image from "next/image";
import { Metadata } from "next";
import { Bot, Mail, Shield, Zap } from "lucide-react";

const UserAuthForm = lazy(() => import("./user-auth-form"));

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to AssistCX",
};

const features = [
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Automate complex workflows with intelligent agents",
  },
  {
    icon: Mail,
    title: "Smart Email Processing",
    description: "Classify, route, and process emails automatically",
  },
  {
    icon: Zap,
    title: "Seamless Integrations",
    description: "Connect with your existing tools, email, and ERP",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SSO, RBAC, and data governance at every layer",
  },
];

const LoginPage = () => {
  return (
    <div className="relative h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-zinc-900 via-zinc-800/80 to-zinc-900" />

        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/6 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-[20%] left-0 right-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
          <div className="absolute top-[50%] left-0 right-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
          <div className="absolute top-[80%] left-0 right-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
          <div className="absolute left-[30%] top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white to-transparent" />
          <div className="absolute left-[70%] top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white to-transparent" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex gap-3 items-center">
            <Image
              src="/icon.svg"
              priority={false}
              width={0}
              height={0}
              sizes="100vh"
              alt="AssistCX"
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold tracking-tight">AssistCX</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-semibold leading-tight">
              Supercharge your operations
              <br />
              <span className="text-zinc-400">
                with AI-powered autonomous agents.
              </span>
            </h2>
            {/* <p className="text-zinc-500 mt-3 text-sm leading-relaxed max-w-md">
              Streamline customer support, automate workflows, and unlock
              insights from every interaction.
            </p> */}
          </div>

          <div className="grid grid-cols-2 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="space-y-2 p-3 rounded-xl bg-white/6 border border-white/8 backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white/8">
                    <feature.icon className="h-4 w-4 text-zinc-300" />
                  </div>
                  <span className="text-sm font-medium">{feature.title}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer to push content to center */}
        <div className="relative z-10" />
      </div>

      {/* Right panel */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 overflow-hidden">
        {/* Subtle background pattern for right panel */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <Image
              src="/icon.svg"
              priority={false}
              width={0}
              height={0}
              sizes="100vh"
              alt="AssistCX"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">AssistCX</span>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              </div>
            }
          >
            <UserAuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
