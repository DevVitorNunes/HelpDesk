"use client";

import { useActionState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createComment } from "@/lib/actions/comments.actions";

type State = { error?: string } | undefined;

interface CommentFormProps {
  ticketId: string;
  onSuccess?: () => void;
}

export function CommentForm({ ticketId, onSuccess }: CommentFormProps) {
  const action = createComment.bind(null, ticketId);
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const prevPendingRef = useRef(false);

  useEffect(() => {
    if (prevPendingRef.current && !pending && !state?.error) {
      formRef.current?.reset();
      onSuccess?.();
    }
    prevPendingRef.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <Textarea
        name="body"
        placeholder="Escreva um comentário..."
        rows={2}
        error={state?.error}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={pending}>
          Comentar
        </Button>
      </div>
    </form>
  );
}
