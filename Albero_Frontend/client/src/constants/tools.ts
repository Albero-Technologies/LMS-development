// Icons
import { FaAppStoreIos, FaAws, FaCss3Alt, FaHtml5, FaJsSquare, FaLaravel, FaWordpress, FaGithub, FaDocker, FaLinux } from 'react-icons/fa'
import { RiNextjsFill, RiReactjsFill, RiTailwindCssFill, RiSupabaseFill } from 'react-icons/ri'
import { IoLogoNodejs } from 'react-icons/io5'
import {
    SiExpress,
    SiGodaddy,
    SiHostinger,
    SiMongodb,
    SiPhp,
    SiPostgresql,
    SiRedis,
    SiTypescript,
    SiGraphql,
    SiFirebase,
    SiStripe,
    SiVercel,
    SiNetlify,
    SiCloudflare,
    SiNginx,
    SiPrisma
} from 'react-icons/si'
import { TbBrandMysql, TbSeo } from 'react-icons/tb'
import { PiFigmaLogoFill } from 'react-icons/pi'
import { GrAndroid } from 'react-icons/gr'

// ─── Row 1: Frontend & Design ─────────────────────────────────────────────────
const row1 = [
    { id: 1, icon: FaHtml5, iconName: 'HTML5' },
    { id: 2, icon: FaCss3Alt, iconName: 'CSS3' },
    { id: 3, icon: FaJsSquare, iconName: 'JavaScript' },
    { id: 4, icon: SiTypescript, iconName: 'TypeScript' },
    { id: 5, icon: RiTailwindCssFill, iconName: 'Tailwind CSS' },
    { id: 6, icon: RiReactjsFill, iconName: 'React JS' },
    { id: 7, icon: RiNextjsFill, iconName: 'Next.js' },
    { id: 8, icon: PiFigmaLogoFill, iconName: 'Figma' },
    { id: 9, icon: FaWordpress, iconName: 'WordPress' },
    { id: 10, icon: TbSeo, iconName: 'SEO' }
]

// ─── Row 2: Backend & Database ────────────────────────────────────────────────
const row2 = [
    { id: 11, icon: IoLogoNodejs, iconName: 'NodeJS' },
    { id: 12, icon: SiExpress, iconName: 'Express' },
    { id: 13, icon: FaLaravel, iconName: 'Laravel' },
    { id: 14, icon: SiPhp, iconName: 'PHP' },
    { id: 15, icon: SiMongodb, iconName: 'MongoDB' },
    { id: 16, icon: TbBrandMysql, iconName: 'MySQL' },
    { id: 17, icon: SiPostgresql, iconName: 'PostgreSQL' },
    { id: 18, icon: SiRedis, iconName: 'Redis' },
    { id: 19, icon: SiPrisma, iconName: 'Prisma' },
    { id: 20, icon: SiGraphql, iconName: 'GraphQL' }
]

// ─── Row 3: Cloud, DevOps & Mobile ───────────────────────────────────────────
const row3 = [
    { id: 21, icon: FaAws, iconName: 'AWS' },
    { id: 22, icon: SiVercel, iconName: 'Vercel' },
    { id: 23, icon: SiNetlify, iconName: 'Netlify' },
    { id: 24, icon: SiCloudflare, iconName: 'Cloudflare' },
    { id: 25, icon: FaDocker, iconName: 'Docker' },
    { id: 26, icon: SiNginx, iconName: 'Nginx' },
    { id: 27, icon: SiFirebase, iconName: 'Firebase' },
    { id: 28, icon: RiSupabaseFill, iconName: 'Supabase' },
    { id: 29, icon: SiStripe, iconName: 'Stripe' },
    { id: 30, icon: FaGithub, iconName: 'GitHub' },
    { id: 31, icon: FaLinux, iconName: 'Linux' },
    { id: 32, icon: GrAndroid, iconName: 'Android' },
    { id: 33, icon: FaAppStoreIos, iconName: 'iOS' },
    { id: 34, icon: SiHostinger, iconName: 'Hostinger' },
    { id: 35, icon: SiGodaddy, iconName: 'GoDaddy' }
]

export const toolsData = {
    heading: 'Empowering Business Through Technology',
    logos: [...row1, ...row2, ...row3], // kept for backward compat
    row1,
    row2,
    row3,
    rowLabels: {
        row1: 'Frontend & Design',
        row2: 'Backend & Database',
        row3: 'Cloud · DevOps · Mobile'
    }
}
