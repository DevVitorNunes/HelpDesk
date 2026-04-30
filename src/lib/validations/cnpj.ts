export function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");

  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (nums: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(nums[i], 10) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calcDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return d1 === parseInt(digits[12], 10) && d2 === parseInt(digits[13], 10);
}

export function formatCNPJ(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
