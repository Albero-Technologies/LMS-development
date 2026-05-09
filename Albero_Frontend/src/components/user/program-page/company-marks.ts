// Pure data + helpers for the company-mark registry. Lives in its own
// module so React fast-refresh keeps working for the CompanyMark
// component file (fast-refresh requires component files to export only
// components).

interface CompanyDef {
    monogram?: string
    color: string
    sector?: 'Big Tech' | 'Fintech' | 'Consumer' | 'Consulting' | 'Services' | 'Cloud' | 'Finance' | 'AI'
}

const COMPANY_REGISTRY: Record<string, CompanyDef> = {
    google:        { monogram: 'G',  color: '#4285F4', sector: 'Big Tech' },
    microsoft:     { monogram: 'MS', color: '#5E5E5E', sector: 'Big Tech' },
    amazon:        { monogram: 'A',  color: '#FF9900', sector: 'Big Tech' },
    meta:          { monogram: 'M',  color: '#0866FF', sector: 'Big Tech' },
    apple:         { monogram: 'A',  color: '#1d1d1f', sector: 'Big Tech' },
    netflix:       { monogram: 'N',  color: '#E50914', sector: 'Big Tech' },
    adobe:         { monogram: 'A',  color: '#FA0F00', sector: 'Big Tech' },
    ibm:           { monogram: 'IBM', color: '#0F62FE', sector: 'Big Tech' },
    flipkart:      { monogram: 'F',  color: '#2874F0', sector: 'Consumer' },
    'walmart labs':{ monogram: 'W',  color: '#0071CE', sector: 'Big Tech' },
    razorpay:      { monogram: 'R',  color: '#3395FF', sector: 'Fintech' },
    phonepe:       { monogram: 'Pe', color: '#5F259F', sector: 'Fintech' },
    cred:          { monogram: 'C',  color: '#0F0F0F', sector: 'Fintech' },
    swiggy:        { monogram: 'S',  color: '#FC8019', sector: 'Consumer' },
    zomato:        { monogram: 'Z',  color: '#E23744', sector: 'Consumer' },
    meesho:        { monogram: 'M',  color: '#F43397', sector: 'Consumer' },
    deloitte:      { monogram: 'D',  color: '#86BC25', sector: 'Consulting' },
    ey:            { monogram: 'EY', color: '#FFE600', sector: 'Consulting' },
    accenture:     { monogram: 'A',  color: '#A100FF', sector: 'Consulting' },
    pwc:           { monogram: 'PwC', color: '#FB6531', sector: 'Consulting' },
    kpmg:          { monogram: 'K',  color: '#00338D', sector: 'Consulting' },
    tcs:           { monogram: 'T',  color: '#0044AA', sector: 'Services' },
    infosys:       { monogram: 'I',  color: '#007CC3', sector: 'Services' },
    wipro:         { monogram: 'W',  color: '#341F65', sector: 'Services' },
    'goldman sachs': { monogram: 'GS', color: '#7399C6', sector: 'Finance' },
    'jp morgan':   { monogram: 'JP', color: '#00377C', sector: 'Finance' },
    morganstanley: { monogram: 'MS', color: '#003D8F', sector: 'Finance' },
    openai:        { monogram: 'AI', color: '#10A37F', sector: 'AI' },
    anthropic:     { monogram: 'C',  color: '#D97757', sector: 'AI' }
}

const FALLBACK_TONE = '#14785f' // Albero emerald.

const monogramFor = (name: string): string => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

export interface CompanyMarkInfo {
    monogram: string
    color: string
    sector?: CompanyDef['sector']
}

export const resolveCompanyMark = (name: string): CompanyMarkInfo => {
    const def = COMPANY_REGISTRY[name.toLowerCase()]
    return {
        monogram: def?.monogram ?? monogramFor(name),
        color: def?.color ?? FALLBACK_TONE,
        sector: def?.sector
    }
}
