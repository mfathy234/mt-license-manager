"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Input, Label } from "@/components/ui";

export function RecipientForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, active: true })
    });
    setMessage(response.ok ? "Recipient added." : "Add failed.");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
      <Label>
        Name
        <Input name="name" required />
      </Label>
      <Label>
        Email
        <Input name="email" type="email" required />
      </Label>
      <div className="flex items-end">
        <Button>Add</Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground sm:col-span-3">{message}</p> : null}
    </form>
  );
}

export function GroupForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, active: true, recipientIds: [] })
    });
    setMessage(response.ok ? "Group added." : "Add failed.");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <Label>
        Group name
        <Input name="name" required />
      </Label>
      <div className="flex items-end">
        <Button>Add</Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground sm:col-span-2">{message}</p> : null}
    </form>
  );
}

export function UserInviteForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    setMessage(response.ok ? "User created." : "Create failed.");
    if (response.ok) {
      event.currentTarget.reset();
      router.refresh();
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_1fr_140px_1fr_auto]">
      <Label>
        Name
        <Input name="name" />
      </Label>
      <Label>
        Email
        <Input name="email" type="email" required />
      </Label>
      <Label>
        Role
        <select name="role" className="focus-ring h-10 rounded-md border border-border bg-elevated px-3 text-sm">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </Label>
      <Label>
        Temporary password
        <Input name="temporaryPassword" type="password" minLength={10} required />
      </Label>
      <div className="flex items-end">
        <Button>Create</Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground lg:col-span-5">{message}</p> : null}
    </form>
  );
}
