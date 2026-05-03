import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1'
import { Badge } from '@/components/ui/badge'
import { testimonialsData } from '@/constants/testimonials'

const firstColumn = testimonialsData.testimonials.slice(0, 3)
const secondColumn = testimonialsData.testimonials.slice(3, 6)
const thirdColumn = testimonialsData.testimonials.slice(6, 9)

export default function Testimonials() {
    return (
        <div className="bg-black px-5 py-12 md:py-20">
            <div className="container z-10 mx-auto">
                <div className="text-center mb-16">
                    <Badge
                        variant="outline"
                        className="mb-6 text-white text-xl">
                        {testimonialsData.badgeTitle}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">{testimonialsData.title}</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-white">{testimonialsData.subtitle}</p>
                </div>

                <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
                    <TestimonialsColumn
                        testimonials={firstColumn}
                        duration={15}
                    />
                    <TestimonialsColumn
                        testimonials={secondColumn}
                        className="hidden md:block"
                        duration={19}
                    />
                    <TestimonialsColumn
                        testimonials={thirdColumn}
                        className="hidden lg:block"
                        duration={17}
                    />
                </div>
            </div>
        </div>
    )
}
