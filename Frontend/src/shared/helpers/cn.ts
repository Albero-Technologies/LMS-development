import clsx, { type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Small helper: merge conditional classes and resolve Tailwind conflicts.
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
