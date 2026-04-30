import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <p className="text-xl font-semibold text-gray-900">Página não encontrada</p>
      <p className="text-sm text-gray-500">
        A página que você procura não existe ou foi removida.
      </p>
      <Link href="/">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
