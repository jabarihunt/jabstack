import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
}

export function formatNumber(value: number, locale: string = 'en-US'): string {
	return new Intl.NumberFormat(locale).format(value);
}

export function formatPercentage(value: number, locale: string = 'en-US'): string {
	const sign = value >= 0 ? '+' : '';
	return `${sign}${new Intl.NumberFormat(locale, {
		style: 'percent',
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}).format(value / 100)}`;
}
