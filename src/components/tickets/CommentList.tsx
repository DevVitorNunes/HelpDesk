"use client";

import { useState } from "react";
import { User, Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { updateComment, deleteComment } from "@/lib/actions/comments.actions";
import type { Comment, AppUser } from "@/types/app.types";

type CommentEntry = Comment & { users: Pick<AppUser, "id" | "name"> };

interface CommentListProps {
  comments: CommentEntry[];
  ticketId: string;
  userId: string;
  isAdmin: boolean;
  onRefresh?: () => void;
}

export function CommentList({ comments, ticketId, userId, isAdmin, onRefresh }: CommentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(commentId: string) {
    setSaving(true);
    const result = await updateComment(commentId, editingBody);
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    setEditingId(null);
    onRefresh?.();
  }

  async function handleDelete(commentId: string) {
    if (!confirm("Remover este comentário?")) return;
    const result = await deleteComment(commentId, ticketId);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Comentário removido.");
    onRefresh?.();
  }

  if (comments.length === 0) {
    return <p className="text-sm text-gray-400">Nenhum comentário ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => {
        const canModify = c.author_id === userId || isAdmin;
        const isEditing = editingId === c.id;

        return (
          <div key={c.id} className="rounded-lg border border-border bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-light shrink-0">
                <User className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                {c.users?.name ?? "Usuário"}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(c.created_at)}</span>
              {canModify && !isEditing && (
                <div className="flex items-center gap-0.5 ml-1 shrink-0">
                  <button
                    onClick={() => { setEditingId(c.id); setEditingBody(c.body); }}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                    aria-label="Editar comentário"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remover comentário"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  rows={3}
                  autoFocus
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-200"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(c.id)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
