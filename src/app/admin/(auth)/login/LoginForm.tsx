"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 w-full rounded-sm bg-[image:var(--ax-gradient-spectral)] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="flex w-full max-w-[380px] flex-col gap-5">
      {state.error && (
        <p role="alert" className="rounded-sm border border-ax-error/40 bg-ax-error/10 px-4 py-3 text-sm text-ax-error">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[13px] text-ax-text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-[13px] text-ax-text-muted">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
