"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { getErrorMessage, requestJson } from "@/lib/http";

export type FormStatus = "idle" | "saving" | "success" | "error";

type SubmitOptions = {
  url: string;
  successMessage: string;
  method?: "POST" | "PUT" | "PATCH";
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
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
export function useFormSubmit({
  url,
  successMessage,
  method = "POST",
  resetOnSuccess = true,
  onSuccess,
  toBody,
}: SubmitOptions) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const submitting = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    submitting.current = true;
    setStatus("saving");
    setMessage("");

    try {
      await requestJson(url, { method, body: toBody(new FormData(form)) });
      if (resetOnSuccess) form.reset();
      onSuccess?.();
      setStatus("success");
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  }

  return { status, message, submit, saving: status === "saving" };
}
