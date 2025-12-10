import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDollarCurrency(amount: number): string {
    const numStr = Math.floor(amount).toString();

    let result = "";
    for (let i = 0; i < numStr.length; i++) {
        if (i > 0 && (numStr.length - i) % 3 === 0) {
            result += ".";
        }
        result += numStr[i];
    }

    return "$" + result;
}
