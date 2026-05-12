// Pure data + helpers for the company-mark registry.
// Logo strategy: use direct CDN/public URLs that don't require CORS preflight.
// Google's t3.gstatic.com favicon service returns images without CORS restrictions.

interface CompanyDef {
    monogram?: string
    color: string
    sector?: 'Big Tech' | 'Fintech' | 'Consumer' | 'Consulting' | 'Services' | 'Cloud' | 'Finance' | 'AI'
    /** Direct logo URL — must be a CORS-friendly source */
    logoUrl?: string
}

// Google's public favicon/logo service — no CORS, no auth, always works
const g = (domain: string, size = 128) => `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`

const COMPANY_REGISTRY: Record<string, CompanyDef> = {
    google: {
        monogram: 'G',
        color: '#4285F4',
        sector: 'Big Tech',
        logoUrl: g('google.com')
    },
    microsoft: {
        monogram: 'MS',
        color: '#5E5E5E',
        sector: 'Big Tech',
        logoUrl: g('microsoft.com')
    },
    amazon: {
        monogram: 'A',
        color: '#FF9900',
        sector: 'Big Tech',
        logoUrl: g('amazon.com')
    },
    meta: {
        monogram: 'M',
        color: '#0866FF',
        sector: 'Big Tech',
        logoUrl: g('meta.com')
    },
    apple: {
        monogram: 'A',
        color: '#1d1d1f',
        sector: 'Big Tech',
        logoUrl: g('apple.com')
    },
    netflix: {
        monogram: 'N',
        color: '#E50914',
        sector: 'Big Tech',
        logoUrl: g('netflix.com')
    },
    adobe: {
        monogram: 'Ad',
        color: '#FA0F00',
        sector: 'Big Tech',
        logoUrl: g('adobe.com')
    },
    ibm: {
        monogram: 'IBM',
        color: '#0F62FE',
        sector: 'Big Tech',
        logoUrl: g('ibm.com')
    },
    flipkart: {
        monogram: 'F',
        color: '#2874F0',
        sector: 'Consumer',
        logoUrl: g('flipkart.com')
    },
    'walmart labs': {
        monogram: 'WL',
        color: '#0071CE',
        sector: 'Big Tech',
        logoUrl: g('walmart.com')
    },
    razorpay: {
        monogram: 'R',
        color: '#3395FF',
        sector: 'Fintech',
        logoUrl: g('razorpay.com')
    },
    phonepe: {
        monogram: 'Pe',
        color: '#5F259F',
        sector: 'Fintech',
        logoUrl: g('phonepe.com')
    },
    cred: {
        monogram: 'C',
        color: '#0F0F0F',
        sector: 'Fintech',
        logoUrl: g('cred.club')
    },
    swiggy: {
        monogram: 'S',
        color: '#FC8019',
        sector: 'Consumer',
        logoUrl: g('swiggy.com')
    },
    zomato: {
        monogram: 'Z',
        color: '#E23744',
        sector: 'Consumer',
        logoUrl: g('zomato.com')
    },
    meesho: {
        monogram: 'Me',
        color: '#F43397',
        sector: 'Consumer',
        logoUrl: g('meesho.com')
    },
    deloitte: {
        monogram: 'D',
        color: '#86BC25',
        sector: 'Consulting',
        logoUrl: g('deloitte.com')
    },
    ey: {
        monogram: 'EY',
        color: '#2E2E38',
        sector: 'Consulting',
        logoUrl: g('ey.com')
    },
    accenture: {
        monogram: 'Ac',
        color: '#A100FF',
        sector: 'Consulting',
        logoUrl: g('accenture.com')
    },
    pwc: {
        monogram: 'PwC',
        color: '#E0301E',
        sector: 'Consulting',
        logoUrl: g('pwc.com')
    },
    kpmg: {
        monogram: 'K',
        color: '#00338D',
        sector: 'Consulting',
        logoUrl: g('kpmg.com')
    },
    tcs: {
        monogram: 'TCS',
        color: '#0044AA',
        sector: 'Services',
        logoUrl: g('tcs.com')
    },
    infosys: {
        monogram: 'In',
        color: '#007CC3',
        sector: 'Services',
        logoUrl: g('infosys.com')
    },
    wipro: {
        monogram: 'W',
        color: '#341F65',
        sector: 'Services',
        logoUrl: g('wipro.com')
    },
    'goldman sachs': {
        monogram: 'GS',
        color: '#7399C6',
        sector: 'Finance',
        logoUrl: g('goldmansachs.com')
    },
    'jp morgan': {
        monogram: 'JP',
        color: '#00377C',
        sector: 'Finance',
        logoUrl: g('jpmorgan.com')
    },
    openai: {
        monogram: 'AI',
        color: '#10A37F',
        sector: 'AI',
        logoUrl: g('openai.com')
    },
    salesforce: {
        monogram: 'SF',
        color: '#00A1E0',
        sector: 'Cloud',
        logoUrl: g('salesforce.com')
    },
    oracle: {
        monogram: 'Or',
        color: '#C74634',
        sector: 'Cloud',
        logoUrl: g('oracle.com')
    },
    uber: {
        monogram: 'Ub',
        color: '#000000',
        sector: 'Consumer',
        logoUrl: g('uber.com')
    },
    paytm: {
        monogram: 'PT',
        color: '#00BAF2',
        sector: 'Fintech',
        logoUrl: g('paytm.com')
    }
}

const FALLBACK_TONE = '#14785f'

const monogramFor = (name: string): string => {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

export interface CompanyMarkInfo {
    monogram: string
    color: string
    sector?: CompanyDef['sector']
    logoUrl?: string
}

export const resolveCompanyMark = (name: string): CompanyMarkInfo => {
    const def = COMPANY_REGISTRY[name.toLowerCase()]
    return {
        monogram: def?.monogram ?? monogramFor(name),
        color: def?.color ?? FALLBACK_TONE,
        sector: def?.sector,
        logoUrl: def?.logoUrl
    }
}
