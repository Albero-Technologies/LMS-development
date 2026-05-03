import { clsx, type ClassValue } from 'clsx' // Import the clsx and ClassValue types from the clsx module
import { twMerge } from 'tailwind-merge' // Import the twMerge function from the tailwind-merge module for merging Tailwind CSS classes
import { format, formatDistanceToNowStrict } from 'date-fns' // Import the format and formatDistanceToNowStrict functions from the date-fns module

// Classnames
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// View and Download File
export const handleViewAndDownloadFile = (filePath: string, fileName = 'document.pdf') => {
    // Open PDF in a new tab
    window.open(filePath, '_blank')

    // Trigger download
    const link = document.createElement('a')
    link.href = filePath
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Get the current year
export const getCurrentYear = (): number => {
    return new Date().getFullYear()
}

// Helper function to generate random colors
export function getRandomColor() {
    const letters = '0123456789ABCDEF' // hex characters
    let color = '#' // color string
    for (let i = 0; i < 6; i++) {
        // loop to generate 6 characters
        color += letters[Math.floor(Math.random() * 16)] // add random hex character
    }
    return color // return the color
}

// Add the following functions to the file
export function extractHashtags(content: string) {
    const regex = /#(\w+)/g // regex to match hashtags
    const hashtags = [] // array to store hashtags
    let match // variable to store the match

    while ((match = regex.exec(content)) !== null) {
        hashtags.push(match[0]) // match[0] gives the full hashtag
    }

    return hashtags // return the hashtags
}

// Format a date relative to the current date
export function formatRelativeDate(from: Date | string) {
    // Convert from to a Date object if it is a string
    const dateFrom = new Date(from)

    // Check if the date conversion was successful
    if (isNaN(dateFrom.getTime())) {
        throw new Error('Invalid date passed to formatRelativeDate.')
    }

    const currentDate = new Date() // current date

    // Check if the date is within the last 24 hours
    if (currentDate.getTime() - dateFrom.getTime() < 24 * 60 * 60 * 1000) {
        return formatDistanceToNowStrict(dateFrom, { addSuffix: true }) // format the distance to now
    } else {
        // Check if the date is within the current year
        if (currentDate.getFullYear() === dateFrom.getFullYear()) {
            // Format the date
            return format(dateFrom, 'MMM d')
        } else {
            // Format the date
            return format(dateFrom, 'MMM d, yyyy')
        }
    }
}

// Add the following functions to the file
export function formatNumber(n: number): string {
    //
    return Intl.NumberFormat('en-US', {
        // format the number
        notation: 'compact', // compact notation
        maximumFractionDigits: 1 // maximum fraction digits
    }).format(n) // format the number
}

// Add the following functions to the file
export function slugify(input: string): string {
    return input // return the input
        .toLowerCase() // convert to lowercase
        .replace(/ /g, '-') // replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // remove non-alphanumeric characters
}
