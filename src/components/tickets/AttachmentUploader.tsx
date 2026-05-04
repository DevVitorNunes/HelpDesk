"use client";

import { useRef, useState } from "react";
import { Paperclip, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveAttachmentMetadata, deleteAttachment } from "@/lib/actions/attachments.actions";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Attachment } from "@/types/app.types";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface AttachmentUploaderProps {
  ticketId: string;
  attachments: Attachment[];
  userId: string;
  onSuccess?: () => void;
}

export function AttachmentUploader({
  ticketId,
  attachments,
  userId,
  onSuccess,
}: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > MAX_SIZE) {
      setError("Arquivo excede o limite de 10MB.");
      return;
    }

    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const path = `${userId}/${ticketId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file);

    if (uploadError) {
      setError("Erro ao fazer upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("attachments").getPublicUrl(path);

    await saveAttachmentMetadata(ticketId, file.name, data.publicUrl, file.size);
    setUploading(false);

    if (inputRef.current) inputRef.current.value = "";

    toast.success("Anexo adicionado com sucesso!");
    onSuccess?.();
  }

  async function handleDelete(attachment: Attachment) {
    if (!confirm("Remover este anexo?")) return;
    const storagePath = new URL(attachment.url).pathname.split("/attachments/")[1];
    await deleteAttachment(attachment.id, ticketId, storagePath);
    toast.success("Anexo removido.");
    onSuccess?.();
  }

  async function handleDownload(attachment: Attachment) {
    const supabase = getSupabaseBrowserClient();
    const storagePath = new URL(attachment.url).pathname.split("/attachments/")[1];
    const { data } = await supabase.storage
      .from("attachments")
      .createSignedUrl(storagePath, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Enviando..." : "Adicionar anexo"}
        </Button>
        <span className="text-xs text-gray-400">Máx. 10MB por arquivo</span>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2 sm:gap-3"
            >
              <Paperclip className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800">
                  {a.nome_arquivo}
                </p>
                {a.tamanho_bytes && (
                  <p className="text-xs text-gray-400">
                    {formatBytes(a.tamanho_bytes)}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                <button
                  onClick={() => handleDownload(a)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  aria-label="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
