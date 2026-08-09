"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getErrorMessage, requestJson } from "@/lib/http";

export type FormStatus = "idle" | "saving" | "success" | "error";

type SubmitOptions = {
  url: string;
  successMessage: string;
  /** Maps the raw form entries into the request body. */
  toBody: (form: FormData) => unknown;
};

/**
 * Shared submit handler for the small admin forms.
 *
 * The form element is captured before the first `await`: React nulls
 * `event.currentTarget` once the handler yields, so resetting it afterwards
 * throws and silently skips the refresh.
 */
export function useFormSubmit({ url, successMessage, toBody }: SubmitOptions) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("saving");
    setMessage("");

    try {
      await requestJson(url, { method: "POST", body: toBody(new FormData(form)) });
      form.reset();
      setStatus("success");
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  }

  return { status, message, submit, saving: status === "saving" };
}
