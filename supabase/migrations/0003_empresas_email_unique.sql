-- Block duplicate empresa emails regardless of case
CREATE UNIQUE INDEX empresas_email_unique ON public.empresas (lower(email));
