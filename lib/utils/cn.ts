import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN", symbol = "₦"): string {
  return `${symbol}${amount.toLocaleString("en-NG")}`;
}
