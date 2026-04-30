import { z } from "zod";

export const ClienteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional().nullable(),
});

export type ClienteFormValues = z.infer<typeof ClienteSchema>;
