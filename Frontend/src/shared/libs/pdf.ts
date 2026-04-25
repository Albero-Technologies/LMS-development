import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Lightweight PDF generator used across SA reports + tenant statements +
// invoice exports. We deliberately avoid html2canvas — generating from data
// directly produces sharper, smaller PDFs and works offline.

export interface PdfTableInput {
    title: string
    subtitle?: string
    head: string[][]
    body: (string | number)[][]
    summary?: { label: string; value: string }[]
    foot?: string[][]
}

// Internal: build the jsPDF document. Both `downloadTablePdf` (save) and
// `viewTablePdf` (open in new tab as preview) use this — the only difference
// is the final action.
const buildTablePdf = (input: PdfTableInput): jsPDF => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40

    // Header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(input.title, margin, 50)

    if (input.subtitle) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100)
        doc.text(input.subtitle, margin, 68)
        doc.setTextColor(0)
    }

    // Generated-on line — small print, top-right.
    doc.setFontSize(9)
    doc.setTextColor(140)
    doc.text(
        `Generated ${new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`,
        doc.internal.pageSize.getWidth() - margin,
        50,
        { align: 'right' }
    )
    doc.setTextColor(0)

    let cursorY = input.subtitle ? 90 : 75

    // Summary band — KPIs above the table.
    if (input.summary && input.summary.length > 0) {
        const cellWidth = (doc.internal.pageSize.getWidth() - margin * 2) / input.summary.length
        input.summary.forEach((s, i) => {
            const x = margin + cellWidth * i
            doc.setFontSize(8)
            doc.setTextColor(120)
            doc.text(s.label.toUpperCase(), x, cursorY)
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(20)
            doc.text(s.value, x, cursorY + 18)
            doc.setFont('helvetica', 'normal')
        })
        cursorY += 36
    }

    autoTable(doc, {
        startY: cursorY,
        head: input.head,
        body: input.body,
        foot: input.foot,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [12, 22, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        footStyles: { fillColor: [240, 240, 245], textColor: 30, fontStyle: 'bold' }
    })

    return doc
}

// Save the PDF — triggers the browser's download flow.
export const downloadTablePdf = (filename: string, input: PdfTableInput): void => {
    const doc = buildTablePdf(input)
    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

// Open the PDF in a new tab without downloading. Useful for "View" actions
// where the user wants a quick look before deciding whether to save.
export const viewTablePdf = (input: PdfTableInput): void => {
    const doc = buildTablePdf(input)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Revoke the URL after a delay so the new tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// Currency helpers shared by report/statement callers.
export const fmtPaiseINR = (paise: number | null | undefined): string => {
    if (!paise) return '₹0'
    return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export const fmtRupeeINR = (rupees: number | null | undefined): string => {
    if (!rupees && rupees !== 0) return '₹0'
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export const fmtDate = (iso: string | null | undefined): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
