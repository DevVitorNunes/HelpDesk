import { z } from "zod";

export const AgenteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional().nullable(),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .optional(),
});

export type AgenteFormValues = z.infer<typeof AgenteSchema>;
