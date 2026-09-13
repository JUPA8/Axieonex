"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ArticleFormState } from "./actions";

const FIELD_CLASSES =
  "min-h-11 rounded-md border border-ax-border-default bg-ax-surface-raised px-3.5 py-3 text-[14.5px] text-ax-text-primary focus:border-ax-violet";

export type ArticleFormValues = {
  slug: string;
  title: string;
  category: string;
  color: string;
  intro: string;
  h2a: string;
  bodyA: string;
  h2b: string;
  bodyB: string;
  closing: string;
  published: boolean;
};

const EMPTY_VALUES: ArticleFormValues = {
  slug: "",
  title: "",
  category: "",
  color: "#3E7BFA",
  intro: "",
  h2a: "",
  bodyA: "",
  h2b: "",
  bodyB: "",
  closing: "",
  published: false,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-sm bg-[image:var(--ax-gradient-spectral)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function ArticleForm({
  action,
  initialValues = EMPTY_VALUES,
  submitLabel,
}: {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  initialValues?: ArticleFormValues;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-[720px] flex-col gap-5">
      {state.error && (
        <p role="alert" className="rounded-sm border border-ax-error/40 bg-ax-error/10 px-4 py-3 text-sm text-ax-error">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="slug" className="text-[13px] text-ax-text-muted">
            Slug
          </label>
          <input id="slug" name="slug" defaultValue={initialValues.slug} className={FIELD_CLASSES} placeholder="my-article-slug" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-[13px] text-ax-text-muted">
            Category
          </label>
          <input id="category" name="category" defaultValue={initialValues.category} className={FIELD_CLASSES} placeholder="Operating model" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-[13px] text-ax-text-muted">
          Title
        </label>
        <input id="title" name="title" defaultValue={initialValues.title} className={FIELD_CLASSES} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="color" className="text-[13px] text-ax-text-muted">
          Accent color (hex)
        </label>
        <input id="color" name="color" defaultValue={initialValues.color} className={`${FIELD_CLASSES} max-w-[160px]`} placeholder="#3E7BFA" />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="intro" className="text-[13px] text-ax-text-muted">
          Intro paragraph
        </label>
        <textarea id="intro" name="intro" rows={3} defaultValue={initialValues.intro} className={FIELD_CLASSES} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="h2a" className="text-[13px] text-ax-text-muted">
            First subheading
          </label>
          <input id="h2a" name="h2a" defaultValue={initialValues.h2a} className={FIELD_CLASSES} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="h2b" className="text-[13px] text-ax-text-muted">
            Second subheading
          </label>
          <input id="h2b" name="h2b" defaultValue={initialValues.h2b} className={FIELD_CLASSES} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bodyA" className="text-[13px] text-ax-text-muted">
          First section body
        </label>
        <textarea id="bodyA" name="bodyA" rows={3} defaultValue={initialValues.bodyA} className={FIELD_CLASSES} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bodyB" className="text-[13px] text-ax-text-muted">
          Second section body
        </label>
        <textarea id="bodyB" name="bodyB" rows={3} defaultValue={initialValues.bodyB} className={FIELD_CLASSES} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="closing" className="text-[13px] text-ax-text-muted">
          Closing paragraph (&quot;What this means for your pipeline&quot;)
        </label>
        <textarea id="closing" name="closing" rows={3} defaultValue={initialValues.closing} className={FIELD_CLASSES} />
      </div>

      <label className="flex items-center gap-3 text-sm text-ax-text-primary">
        <input type="checkbox" name="published" defaultChecked={initialValues.published} className="h-[18px] w-[18px]" />
        Published (visible on the public site)
      </label>

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
