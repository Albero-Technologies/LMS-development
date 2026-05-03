import '../../styles/work.css'

import ParticleCanvas from '@/components/workui/ParticleCanvas'
import CursorGlow from '@/components/workui/CursorGlow'
import ScrollReveal from '@/components/workui/ScrollReveal'
import { workData } from '@/constants/work'

export default function WorkPage() {
    const { hero, collection, projects, industries, techStack, process, aiServices, steamPackages, testimonials, clients, presence, cta } = workData

    // Helper: render mock-img boxes from a mocks array
    const renderMocks = (mocks: Array<{ icon: string; label: string; cls?: string; span?: number }>, gridCls: string, revealCls = '') => (
        <div className={`mock-grid ${gridCls} ${revealCls}`}>
            {mocks.map((m, i) => (
                <div
                    key={i}
                    className={`mock-img${m.cls ? ` ${m.cls}` : ''}`}
                    style={m.span ? { gridColumn: `span ${m.span}` } : undefined}>
                    <div className="icon">{m.icon}</div>
                    <span>{m.label}</span>
                </div>
            ))}
        </div>
    )

    return (
        <div className="work-page">
            <ParticleCanvas />
            <CursorGlow />
            <ScrollReveal />

            {/* HERO */}
            <section
                className="hero"
                id="work">
                <div className="hero-bg"></div>
                <div className="hero-grid"></div>
                <div className="hero-arc"></div>
                <div className="hero-arc-inner"></div>
                <div className="hero-corner tl"></div>
                <div className="hero-corner tr"></div>
                <div className="hero-corner bl"></div>
                <div className="hero-corner br"></div>

                {hero.chips.map((chip, i) => (
                    <div
                        key={i}
                        className={`hero-stat-chip ${chip.pos}`}>
                        <div
                            className={
                                chip.delay ? 'chip-float' : chip.pos.startsWith('c3') || chip.pos.startsWith('c4') ? 'chip-float-r' : 'chip-float'
                            }
                            style={chip.delay ? { animationDelay: chip.delay } : undefined}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className={`chip-icon${chip.amber ? ' amber' : ''}`}>{chip.icon}</div>
                                <div>
                                    <div className="chip-val">{chip.val}</div>
                                    <div className="chip-lbl">{chip.lbl}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    {hero.badge}
                </div>

                <h1>
                    <span className="stroke-word">{hero.titleStroke}</span>
                    <br />
                    {hero.titleLine2}
                    <br />
                    <em>{hero.titleEm}</em>
                </h1>

                <div className="hero-divline"></div>

                <p className="hero-sub">{hero.sub}</p>

                <div className="hero-ctas">
                    {hero.ctas.map((cta, i) => (
                        <a
                            key={i}
                            href={cta.href}
                            className={cta.variant === 'primary' ? 'hero-cta' : 'hero-cta-outline'}>
                            {cta.label}
                            {cta.variant === 'primary' ? (
                                <svg
                                    width="15"
                                    height="15"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 19.5l15-15M19.5 4.5H8.25M19.5 4.5v11.25"
                                    />
                                </svg>
                            )}
                        </a>
                    ))}
                </div>

                <div className="hero-scroll">
                    <span>Scroll</span>
                    <div className="scroll-line"></div>
                </div>

                <div className="hero-ticker">
                    <div className="ticker-track">
                        {[...hero.tickerItems, ...hero.tickerItems].map((item, i) => (
                            <span
                                key={i}
                                className={`ticker-item${item.cls ? ` ${item.cls}` : ''}`}>
                                {item.label}
                                <span className="ticker-dot"></span>
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* COLLECTION INDEX */}
            <div
                className="section reveal"
                id="collection">
                <span className="s-label">{collection.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {collection.title} <span style={{ color: 'var(--blue-vivid)' }}>{collection.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '480px', lineHeight: '1.7' }}>
                    {collection.body}
                </p>
                <div
                    className="collection-wrap stagger"
                    id="collectionList">
                    {collection.items.map((item, i) => (
                        <a
                            key={i}
                            href={item.href}
                            className="collection-item">
                            <div className="item-left">
                                <span className="item-num">{item.num}</span>
                                <span className="item-title">
                                    {item.title} <em>{item.em}</em>
                                </span>
                            </div>
                            <div className="item-right">
                                &quot;{item.cta}&quot; <span>☞</span>
                            </div>
                        </a>
                    ))}
                </div>
                <div
                    className="stats-row stagger"
                    id="statsRow">
                    {collection.stats.map((s, i) => (
                        <div
                            key={i}
                            className="stat-card">
                            <div
                                className="stat-num"
                                data-target={s.target}>
                                0<span className="stat-accent">{s.suffix}</span>
                            </div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* 01 WEB & SOFTWARE */}
            <div
                className="section"
                id="it-web">
                <div className="reveal">
                    <span className="cat-heading">{projects.web.heading}</span>
                </div>
                <div
                    className="project-slider"
                    data-slider="web">
                    <div className="slider-nav reveal">
                        <div
                            className="slider-dots"
                            id="dots-web"></div>
                        <div className="slider-controls">
                            <span className="slider-counter">
                                <span id="cur-web">1</span> / <span id="tot-web">{projects.web.slides.length}</span>
                            </span>
                            <button
                                className="slider-btn"
                                id="prev-web"
                                aria-label="Previous"
                                disabled>
                                &#8592;
                            </button>
                            <button
                                className="slider-btn"
                                id="next-web"
                                aria-label="Next">
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div
                        className="project-slides"
                        id="slides-web">
                        {projects.web.slides.map((slide, i) => (
                            <div
                                key={i}
                                className="project-slide">
                                <div className={`project-block${slide.reverse ? ' reverse' : ''}`}>
                                    <div className={`project-meta ${slide.reverse ? 'reveal-right' : 'reveal-left'}`}>
                                        <div className="meta-client">{slide.client}</div>
                                        <div className="meta-tools">{slide.tools}</div>
                                        <div className="project-desc">{slide.desc}</div>
                                        <div className="tags">
                                            {slide.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="tag">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {slide.phoneMocks ? (
                                        <div className={slide.reverse ? 'reveal-left' : 'reveal-right'}>
                                            <div
                                                className={`mock-grid ${slide.mockGrid}`}
                                                style={{ marginBottom: '10px' }}>
                                                {slide.mocks.map((m, j) => (
                                                    <div
                                                        key={j}
                                                        className="mock-img">
                                                        <div className="icon">{m.icon}</div>
                                                        <span>{m.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="phone-wrap">
                                                <div className="phone">{slide.phoneLabel}</div>
                                                <div
                                                    className="mock-grid c2"
                                                    style={{ flex: '1' }}>
                                                    {slide.phoneMocks.map((m, j) => (
                                                        <div
                                                            key={j}
                                                            className={`mock-img ${m.cls}`}>
                                                            <div className="icon">{m.icon}</div>
                                                            <span>{m.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        renderMocks(slide.mocks, `${slide.mockGrid} ${slide.reverse ? 'reveal-left' : 'reveal-right'}`)
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* 02 E-COMMERCE & SAAS */}
            <div
                className="section"
                id="it-ecom">
                <div className="reveal">
                    <span className="cat-heading">{projects.ecom.heading}</span>
                    <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginBottom: '48px' }}>{projects.ecom.subhead}</p>
                </div>
                <div
                    className="project-slider"
                    data-slider="ecom">
                    <div className="slider-nav reveal">
                        <div
                            className="slider-dots"
                            id="dots-ecom"></div>
                        <div className="slider-controls">
                            <span className="slider-counter">
                                <span id="cur-ecom">1</span> / <span id="tot-ecom">{projects.ecom.slides.length}</span>
                            </span>
                            <button
                                className="slider-btn"
                                id="prev-ecom"
                                aria-label="Previous"
                                disabled>
                                &#8592;
                            </button>
                            <button
                                className="slider-btn"
                                id="next-ecom"
                                aria-label="Next">
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div
                        className="project-slides"
                        id="slides-ecom">
                        {projects.ecom.slides.map((slide, i) => (
                            <div
                                key={i}
                                className="project-slide">
                                <div className={`project-block${slide.reverse ? ' reverse' : ''}`}>
                                    <div className={`project-meta ${slide.reverse ? 'reveal-right' : 'reveal-left'}`}>
                                        <div className="meta-client">{slide.client}</div>
                                        <div className="meta-tools">{slide.tools}</div>
                                        <div className="project-desc">{slide.desc}</div>
                                        <div className="tags">
                                            {slide.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="tag">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {renderMocks(slide.mocks, `${slide.mockGrid} ${slide.reverse ? 'reveal-left' : 'reveal-right'}`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* 03 STEAM LABS */}
            <div
                className="section"
                id="steam-schools">
                <div className="reveal">
                    <span className="cat-heading">{projects.steam.heading}</span>
                    <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginBottom: '48px' }}>{projects.steam.subhead}</p>
                </div>
                <div
                    className="project-slider"
                    data-slider="steam">
                    <div className="slider-nav reveal">
                        <div
                            className="slider-dots"
                            id="dots-steam"></div>
                        <div className="slider-controls">
                            <span className="slider-counter">
                                <span id="cur-steam">1</span> / <span id="tot-steam">{projects.steam.slides.length}</span>
                            </span>
                            <button
                                className="slider-btn"
                                id="prev-steam"
                                aria-label="Previous"
                                disabled>
                                &#8592;
                            </button>
                            <button
                                className="slider-btn"
                                id="next-steam"
                                aria-label="Next">
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div
                        className="project-slides"
                        id="slides-steam">
                        {projects.steam.slides.map((slide, i) => (
                            <div
                                key={i}
                                className="project-slide">
                                <div className={`project-block${slide.reverse ? ' reverse' : ''}`}>
                                    <div className={`project-meta ${slide.reverse ? 'reveal-right' : 'reveal-left'}`}>
                                        <div className="meta-client">{slide.client}</div>
                                        <div className="meta-tools">{slide.tools}</div>
                                        <div className="project-desc">{slide.desc}</div>
                                        <div className="tags">
                                            {slide.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="tag">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {renderMocks(slide.mocks, `${slide.mockGrid} ${slide.reverse ? 'reveal-left' : 'reveal-right'}`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* 04 DIGITAL MARKETING */}
            <div
                className="section"
                id="digital">
                <div className="reveal">
                    <span className="cat-heading">{projects.digital.heading}</span>
                    <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginBottom: '48px' }}>{projects.digital.subhead}</p>
                </div>
                <div
                    className="project-slider"
                    data-slider="digital">
                    <div className="slider-nav reveal">
                        <div
                            className="slider-dots"
                            id="dots-digital"></div>
                        <div className="slider-controls">
                            <span className="slider-counter">
                                <span id="cur-digital">1</span> / <span id="tot-digital">{projects.digital.slides.length}</span>
                            </span>
                            <button
                                className="slider-btn"
                                id="prev-digital"
                                aria-label="Previous"
                                disabled>
                                &#8592;
                            </button>
                            <button
                                className="slider-btn"
                                id="next-digital"
                                aria-label="Next">
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div
                        className="project-slides"
                        id="slides-digital">
                        {projects.digital.slides.map((slide, i) => (
                            <div
                                key={i}
                                className="project-slide">
                                <div className={`project-block${slide.reverse ? ' reverse' : ''}`}>
                                    <div className={`project-meta ${slide.reverse ? 'reveal-right' : 'reveal-left'}`}>
                                        <div className="meta-client">{slide.client}</div>
                                        <div className="meta-tools">{slide.tools}</div>
                                        <div className="project-desc">{slide.desc}</div>
                                        <div className="tags">
                                            {slide.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="tag">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {slide.phoneLabel ? (
                                        <div className={slide.reverse ? 'reveal-left' : 'reveal-right'}>
                                            <div
                                                className={`mock-grid ${slide.mockGrid}`}
                                                style={{ marginBottom: '10px' }}>
                                                {slide.mocks.map((m, j) => (
                                                    <div
                                                        key={j}
                                                        className={`mock-img${m.cls ? ` ${m.cls}` : ''}`}>
                                                        <div className="icon">{m.icon}</div>
                                                        <span>{m.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div
                                                className="phone-wrap"
                                                style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
                                                <div className="phone">{slide.phoneLabel}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        renderMocks(slide.mocks, `${slide.mockGrid} ${slide.reverse ? 'reveal-left' : 'reveal-right'}`)
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="divider" />

            {/* 05 ERP */}
            <div
                className="section"
                id="erp">
                <div className="reveal">
                    <span className="cat-heading">{projects.erp.heading}</span>
                    <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginBottom: '48px' }}>{projects.erp.subhead}</p>
                </div>
                <div
                    className="project-slider"
                    data-slider="erp">
                    <div className="slider-nav reveal">
                        <div
                            className="slider-dots"
                            id="dots-erp"></div>
                        <div className="slider-controls">
                            <span className="slider-counter">
                                <span id="cur-erp">1</span> / <span id="tot-erp">{projects.erp.slides.length}</span>
                            </span>
                            <button
                                className="slider-btn"
                                id="prev-erp"
                                aria-label="Previous"
                                disabled>
                                &#8592;
                            </button>
                            <button
                                className="slider-btn"
                                id="next-erp"
                                aria-label="Next">
                                &#8594;
                            </button>
                        </div>
                    </div>
                    <div
                        className="project-slides"
                        id="slides-erp">
                        {projects.erp.slides.map((slide, i) => (
                            <div
                                key={i}
                                className="project-slide">
                                <div className={`project-block${slide.reverse ? ' reverse' : ''}`}>
                                    <div className={`project-meta ${slide.reverse ? 'reveal-right' : 'reveal-left'}`}>
                                        <div className="meta-client">{slide.client}</div>
                                        <div className="meta-tools">{slide.tools}</div>
                                        <div className="project-desc">{slide.desc}</div>
                                        <div className="tags">
                                            {slide.tags.map((t) => (
                                                <span
                                                    key={t}
                                                    className="tag">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {renderMocks(slide.mocks, `${slide.mockGrid} ${slide.reverse ? 'reveal-left' : 'reveal-right'}`)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* INDUSTRIES */}
            <div
                className="section reveal"
                id="industries">
                <span className="s-label">{industries.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {industries.title} <span style={{ color: 'var(--blue-vivid)' }}>{industries.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '480px', lineHeight: '1.7' }}>
                    {industries.body}
                </p>
                <div className="industry-grid stagger">
                    {industries.items.map((item, i) => (
                        <div
                            key={i}
                            className="industry-card">
                            <div className="industry-icon">{item.icon}</div>
                            <div className="industry-name">{item.name}</div>
                            <div className="industry-desc">{item.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* TECH STACK */}
            <div
                className="section reveal"
                id="tech-stack">
                <span className="s-label">{techStack.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {techStack.title} <span style={{ color: 'var(--blue-vivid)' }}>{techStack.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '560px', lineHeight: '1.7' }}>
                    {techStack.body}
                </p>
                <div
                    className="tech-categories"
                    style={{ overflow: 'visible', maxHeight: 'none', height: 'auto' }}>
                    {techStack.categories.map((cat, i) => (
                        <div
                            key={i}
                            className="tech-category"
                            style={{ opacity: 1, transform: 'none', visibility: 'visible' }}>
                            <div className="tech-cat-label">{cat.label}</div>
                            <div
                                className="tech-pills"
                                style={{ flexWrap: 'wrap', display: 'flex', gap: '8px' }}>
                                {cat.pills.map((p) => (
                                    <span
                                        key={p}
                                        className="tech-pill">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* PROCESS */}
            <div
                className="section reveal"
                id="process">
                <span className="s-label">{process.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {process.title} <span style={{ color: 'var(--blue-vivid)' }}>{process.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '480px', lineHeight: '1.7' }}>{process.body}</p>
                <div className="process-steps stagger">
                    {process.steps.map((s, i) => (
                        <div
                            key={i}
                            className="process-step">
                            <div className="step-num">{s.num}</div>
                            <div className="step-title">{s.title}</div>
                            <div className="step-desc">{s.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* AI & INNOVATION */}
            <div
                className="section reveal"
                id="ai-services">
                <span className="s-label">{aiServices.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {aiServices.title} <span style={{ color: 'var(--blue-vivid)' }}>{aiServices.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '580px', lineHeight: '1.7' }}>
                    {aiServices.body}
                </p>
                <div
                    className="ai-grid"
                    style={{ overflow: 'visible', maxHeight: 'none', height: 'auto' }}>
                    {aiServices.cards.map((card, i) => (
                        <div
                            key={i}
                            className="ai-card"
                            style={{ opacity: 1, transform: 'none', visibility: 'visible' }}>
                            <div className="ai-icon">{card.icon}</div>
                            <div className="ai-title">{card.title}</div>
                            <div className="ai-desc">{card.desc}</div>
                            <div
                                className="tags"
                                style={{ marginTop: '10px' }}>
                                {card.tags.map((t) => (
                                    <span
                                        key={t}
                                        className="tag">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* STEAM PACKAGES */}
            <div
                className="section reveal"
                id="steam-packages">
                <span className="s-label">{steamPackages.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {steamPackages.title} <span style={{ color: 'var(--blue-vivid)' }}>{steamPackages.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '580px', lineHeight: '1.7' }}>
                    {steamPackages.body}
                </p>
                <div className="steam-packages">
                    {steamPackages.packages.map((pkg, i) => (
                        <div
                            key={i}
                            className={`steam-pkg${pkg.featured ? ' featured' : ''} ${i === 0 ? 'reveal-left' : i === 2 ? 'reveal-right' : 'reveal'}`}>
                            {pkg.featured && pkg.badge && <span className="pkg-badge">{pkg.badge}</span>}
                            <div className="pkg-icon">{pkg.icon}</div>
                            <div className="pkg-name">{pkg.name}</div>
                            <div className="pkg-tagline">{pkg.tagline}</div>
                            <ul className="pkg-items">
                                {pkg.items.map((item, j) => (
                                    <li key={j}>{item}</li>
                                ))}
                            </ul>
                            <a
                                href="#cta"
                                className="pkg-cta">
                                Get Started
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* TESTIMONIALS */}
            <div
                className="section reveal"
                id="testimonials">
                <span className="s-label">{testimonials.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {testimonials.title} <span style={{ color: 'var(--blue-vivid)' }}>{testimonials.titleAccent}</span>
                </h2>
                <div className="testimonials-grid stagger">
                    {testimonials.items.map((t, i) => (
                        <div
                            key={i}
                            className="testimonial-card">
                            <div className="quote-mark">&quot;</div>
                            <div className="testimonial-text">{t.text}</div>
                            <div className="testimonial-author">
                                <div className="stars">★★★★★</div>
                                <div
                                    className="author-name"
                                    style={{ marginTop: '8px' }}>
                                    {t.author}
                                </div>
                                <div className="author-role">{t.org}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* CLIENTS */}
            <div
                className="section reveal"
                id="clients">
                <span className="s-label">{clients.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {clients.title} <span style={{ color: 'var(--blue-vivid)' }}>{clients.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '480px', lineHeight: '1.7' }}>{clients.body}</p>
                <div className="logo-grid stagger">
                    {clients.logos.map((logo, i) => (
                        <div
                            key={i}
                            className="logo-card">
                            <div className="logo-initials">{logo.initials}</div>
                            <div className="logo-name">{logo.name}</div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* PRESENCE */}
            <div
                className="section reveal"
                id="presence">
                <span className="s-label">{presence.label}</span>
                <h2
                    style={{
                        fontFamily: "'Bebas Neue',sans-serif",
                        fontSize: 'clamp(40px,6vw,72px)',
                        lineHeight: '.95',
                        letterSpacing: '1px',
                        color: 'var(--white)',
                        marginTop: '8px'
                    }}>
                    {presence.title} <span style={{ color: 'var(--blue-vivid)' }}>{presence.titleAccent}</span>
                </h2>
                <p style={{ color: 'var(--grey-mid)', fontSize: '15px', marginTop: '14px', maxWidth: '480px', lineHeight: '1.7' }}>{presence.body}</p>
                <div className="cities-grid stagger">
                    {presence.cities.map((city, i) => (
                        <div
                            key={i}
                            className="city-card">
                            <div className="city-dot"></div>
                            <div className="city-name">{city}</div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="divider" />

            {/* CTA */}
            <div
                className="cta-section reveal"
                id="cta">
                <div
                    className="float-badge"
                    style={{ marginBottom: '28px' }}>
                    <span className="dot"></span>
                    {cta.badge}
                </div>
                <h2>
                    {cta.title} <em>{cta.titleEm}</em>
                    <br />
                    {cta.titleLine2}
                </h2>
                <p>{cta.body}</p>
                <div className="cta-btns">
                    <a
                        href={cta.primaryHref}
                        className="btn-w">
                        {cta.primaryLabel}
                    </a>
                    <a
                        href={cta.secondaryHref}
                        className="btn-o">
                        {cta.secondaryLabel}
                    </a>
                </div>
            </div>
        </div>
    )
}
