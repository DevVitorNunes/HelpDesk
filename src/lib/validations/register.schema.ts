import { z } from "zod";
import { validateCNPJ } from "./cnpj";

const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

export const RegisterSchema = z.object({
  empresa_nome: z.string().min(2, "Nome da empresa é obrigatório").max(100),
  empresa_cnpj: z
    .string()
    .min(14, "CNPJ inválido")
    .refine(validateCNPJ, { message: "CNPJ inválido" }),
  empresa_email: z.string().email("E-mail da empresa inválido"),
  empresa_telefone: z
    .string()
    .regex(phoneRegex, "Telefone inválido — use (00) 00000-0000")
    .optional()
    .or(z.literal("")),
  admin_nome: z.string().min(2, "Nome do administrador é obrigatório").max(100),
  admin_email: z.string().email("E-mail do administrador inválido"),
  admin_password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha muito longa"),
});

export type RegisterFormValues = z.infer<typeof RegisterSchema>;
