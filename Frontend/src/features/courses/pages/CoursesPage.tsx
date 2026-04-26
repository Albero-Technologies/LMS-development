import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, BookOpen, ArrowRight, Wrench, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Textarea } from '@shared/components/ui/Input'
import { Select } from '@shared/components/ui/Select'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Modal } from '@shared/components/ui/Modal'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { StudentCoursesView } from '../components/StudentCoursesView'
import { listAllTenants } from '@features/admin/services/tenant.service'
import { createCourse, deleteCourse, listCourses, type TCourse as ApiCourse } from '../services/course.service'
import { useConfirm } from '@shared/components/ui/ConfirmDialog'

const slugify = (s: string): string =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48)

export const CoursesPage = () => {
    const user = useAuthStore((s) => s.user)

    // Students get the catalog + enrol/pay flow, not the publish-and-curate view.
    if (user?.role === ROLES.STUDENT) return <StudentCoursesView />

    // SUPER_ADMIN sees a per-tenant catalog drilled in via picker — actual
    // courses come from the backend, scoped to the chosen tenant. Tenant
    // ADMIN/TRAINER stay on the local Zustand mock until the backend wiring
    // for create/edit lands.
    if (user?.role === ROLES.SUPER_ADMIN) return <SuperAdminCoursesView />

    return <AdminCoursesView />
}

// SUPER_ADMIN cross-tenant courses view. Mirrors the Website Editor's tenant
// picker: pick a tenant, see their published + draft course catalog. Read-only
// for now — SAs don't author courses on tenants' behalf, that's tenant ADMIN's
// job; the SA just monitors enrolment counts and publish state.
const SuperAdminCoursesView = () => {
    const [q, setQ] = useState('')
    const [tenantId, setTenantId] = useState('')

    const tenantsQuery = useQuery({ queryKey: ['tenants'], queryFn: listAllTenants, staleTime: 60_000 })
    const tenants = tenantsQuery.data ?? []

    useEffect(() => {
        if (!tenantId && tenants.length > 0) setTenantId(tenants[0].id)
    }, [tenantId, tenants])

    const coursesQuery = useQuery({
        queryKey: ['courses', 'sa', tenantId, q],
        queryFn: () => listCourses({ tenantId, q: q || undefined }),
        enabled: tenantId.length > 0,
        staleTime: 30_000
    })
    const courses = coursesQuery.data ?? []

    const activeTenant = tenants.find((t) => t.id === tenantId)

    return (
        <>
            <PageHeader
                eyebrow="Catalog"
                title="Courses"
                description={
                    activeTenant
                        ? `Catalog for ${activeTenant.name}. Switch tenants to monitor a different institute.`
                        : 'Pick a tenant to see their course catalog.'
                }
                actions={
                    <>
                        <div className="w-64">
                            <Select
                                aria-label="Choose tenant"
                                value={tenantId}
                                onChange={(e) => setTenantId(e.target.value)}>
                                {tenants.length === 0 && <option value="">Loading…</option>}
                                {tenants.map((t) => (
                                    <option
                                        key={t.id}
                                        value={t.id}>
                                        {t.name} (/{t.slug})
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search courses"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search courses"
                            />
                        </div>
                    </>
                }
            />

            {coursesQuery.isLoading && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-32 w-full mb-4" />
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </Card>
                    ))}
                </div>
            )}

            {!coursesQuery.isLoading && courses.length === 0 && (
                <Empty
                    icon={<BookOpen size={36} />}
                    title={q ? 'No matches' : 'No courses for this tenant'}
                    description={
                        q
                            ? 'Try a different search.'
                            : 'This tenant has not published any courses yet. Tenant ADMINs add courses from their own panel.'
                    }
                />
            )}

            {courses.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((c) => (
                        <SuperAdminCourseCard
                            key={c.id}
                            course={c}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

const SuperAdminCourseCard = ({ course }: { course: ApiCourse }) => {
    const isPublished = course.publishState === 'PUBLISHED' || course.isPublished === true
    const enrolled = course.enrolledCount ?? 0
    const cover = course.thumbnailUrl ?? course.coverUrl ?? null
    const priceRupees = Math.round((course.price ?? 0) / 100)
    return (
        <Card className="flex flex-col">
            <div
                className="h-32 rounded-md mb-4 relative overflow-hidden grid-dots"
                style={{
                    background: cover ? undefined : 'linear-gradient(135deg, var(--color-brand-50), var(--color-surface-2))'
                }}>
                {cover ? (
                    <img
                        src={cover}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen
                            size={36}
                            className="text-[var(--color-brand-500)]/60"
                        />
                    </div>
                )}
            </div>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-fg truncate">{course.title}</h3>
                    <p className="text-xs text-fg-muted mt-1 font-mono">/{course.slug}</p>
                </div>
                <Badge tone={isPublished ? 'ok' : 'default'}>{isPublished ? 'Live' : 'Draft'}</Badge>
            </div>
            {course.description && <p className="mt-2 text-sm text-fg-soft line-clamp-2">{course.description}</p>}
            <div className="mt-3 flex items-center justify-between text-sm text-fg-soft">
                <span className="font-mono font-semibold">
                    {priceRupees > 0 ? `₹${priceRupees.toLocaleString('en-IN')}` : 'Free'}
                </span>
                <span className="text-xs text-fg-muted">{enrolled} enrolled</span>
            </div>
        </Card>
    )
}

// Admin / Trainer catalog — pulls from the real backend so the data matches
// what students see (and the SuperAdmin cross-tenant view). Was previously
// backed by a Zustand mock; that meant trainer/admin saw seeded courses
// (System Design Foundations, etc.) while students saw the real catalog —
// confusing, fixed.
const AdminCoursesView = () => {
    const [q, setQ] = useState('')
    const [newOpen, setNewOpen] = useState(false)

    const user = useAuthStore((s) => s.user)
    const canEdit = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER].includes(user.role as never)

    const coursesQuery = useQuery({
        queryKey: ['courses', 'admin', q],
        queryFn: () => listCourses({ q: q || undefined }),
        staleTime: 30_000
    })
    const courses = coursesQuery.data ?? []

    return (
        <>
            <PageHeader
                eyebrow="Catalog"
                title="Courses"
                description="Everything your institute offers. Publish new courses or edit the curriculum."
                actions={
                    <>
                        <div className="w-64 hidden sm:block">
                            <Input
                                placeholder="Search courses"
                                leftIcon={<Search size={14} />}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                aria-label="Search courses"
                            />
                        </div>
                        {canEdit && (
                            <Button
                                leftIcon={<Plus size={14} />}
                                size="sm"
                                onClick={() => setNewOpen(true)}>
                                New course
                            </Button>
                        )}
                    </>
                }
            />

            {coursesQuery.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                        <Card key={i}>
                            <Skeleton className="h-32 w-full mb-4" />
                            <Skeleton className="h-5 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </Card>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <Empty
                    icon={<BookOpen size={36} />}
                    title={q ? 'No matches' : 'No courses yet'}
                    description={q ? 'Try a different search.' : 'Create your first course. It takes about 5 minutes to publish.'}
                    action={
                        canEdit && !q ? (
                            <Button
                                leftIcon={<Plus size={14} />}
                                onClick={() => setNewOpen(true)}>
                                New course
                            </Button>
                        ) : null
                    }
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((c) => (
                        <AdminCourseCard
                            key={c.id}
                            course={c}
                            canEdit={!!canEdit}
                        />
                    ))}
                </div>
            )}

            <NewCourseModal
                open={newOpen}
                onClose={() => setNewOpen(false)}
            />
        </>
    )
}

const AdminCourseCard = ({ course, canEdit }: { course: ApiCourse; canEdit: boolean }) => {
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const isPublished = course.publishState === 'PUBLISHED' || course.isPublished === true
    const enrolled = course.enrolledCount ?? 0
    const cover = course.thumbnailUrl ?? course.coverUrl ?? null
    const priceRupees = Math.round((course.price ?? 0) / 100)

    const deleteMutation = useMutation({
        mutationFn: () => deleteCourse(course.id),
        onSuccess: () => {
            toast.success('Course deleted')
            void queryClient.invalidateQueries({ queryKey: ['courses'] })
        },
        onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Could not delete')
    })

    return (
        <Card className="flex flex-col">
            <div
                className="h-32 rounded-md mb-4 relative overflow-hidden grid-dots"
                style={{
                    background: cover ? undefined : 'linear-gradient(135deg, var(--color-brand-50), var(--color-surface-2))'
                }}>
                {cover ? (
                    <img
                        src={cover}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen
                            size={36}
                            className="text-[var(--color-brand-500)]/60"
                        />
                    </div>
                )}
            </div>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-semibold text-fg truncate">{course.title}</h3>
                    <p className="text-xs text-fg-muted mt-1 font-mono">/{course.slug}</p>
                </div>
                <Badge tone={isPublished ? 'ok' : 'default'}>{isPublished ? 'Live' : 'Draft'}</Badge>
            </div>
            {course.description && <p className="mt-2 text-sm text-fg-soft line-clamp-2">{course.description}</p>}
            <div className="mt-3 flex items-center justify-between text-sm text-fg-soft">
                <span className="font-mono font-semibold">{priceRupees > 0 ? `₹${priceRupees.toLocaleString('en-IN')}` : 'Free'}</span>
                <span className="text-xs text-fg-muted">{enrolled} enrolled</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
                <Link
                    to={`/app/courses/${course.id}`}
                    className="flex-1">
                    <Button
                        variant="ghost"
                        className="w-full"
                        rightIcon={<ArrowRight size={14} />}>
                        View
                    </Button>
                </Link>
                {canEdit && (
                    <Link to={`/app/courses/${course.id}/builder`}>
                        <Button
                            variant="subtle"
                            size="icon"
                            aria-label="Edit curriculum">
                            <Wrench size={14} />
                        </Button>
                    </Link>
                )}
                {canEdit && (
                    <Button
                        variant="subtle"
                        size="icon"
                        aria-label="Delete course"
                        loading={deleteMutation.isPending}
                        onClick={async () => {
                            const ok = await confirm({
                                title: `Delete "${course.title}"?`,
                                description: 'Enrolments and lesson progress are preserved server-side, but the course is hidden from the catalog.',
                                confirmLabel: 'Delete',
                                tone: 'danger'
                            })
                            if (ok) deleteMutation.mutate()
                        }}>
                        <Trash2 size={14} />
                    </Button>
                )}
            </div>
        </Card>
    )
}

// Wraps the backend POST /courses. Title is required; slug is auto-generated
// from the title. Backend stores price in paise; we accept rupees from the UI
// and multiply on submit. On success, navigate to the builder.
const NewCourseModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const queryClient = useQueryClient()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)
    const [description, setDescription] = useState('')
    const [priceRupees, setPriceRupees] = useState('4999')

    const reset = () => {
        setTitle('')
        setSlug('')
        setSlugTouched(false)
        setDescription('')
        setPriceRupees('4999')
    }

    const mutation = useMutation({
        mutationFn: () =>
            createCourse({
                title: title.trim(),
                slug: (slug || slugify(title)).trim(),
                description: description.trim() || undefined,
                price: Math.max(0, Math.round(Number(priceRupees) * 100)),
                currency: 'INR',
                gstPercent: 18
            }),
        onSuccess: (course) => {
            toast.success('Course created — add your first lesson.')
            void queryClient.invalidateQueries({ queryKey: ['courses'] })
            reset()
            onClose()
            window.setTimeout(() => {
                window.location.assign(`/app/courses/${course.id}/builder`)
            }, 50)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not create')
    })

    return (
        <Modal
            open={open}
            onClose={() => {
                reset()
                onClose()
            }}
            title="Create a new course"
            description="You'll add sections and lessons in the next step."
            footer={
                <>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            reset()
                            onClose()
                        }}>
                        Cancel
                    </Button>
                    <Button
                        loading={mutation.isPending}
                        disabled={title.trim().length < 3}
                        onClick={() => mutation.mutate()}>
                        Create & open builder
                    </Button>
                </>
            }>
            <div className="space-y-4">
                <Input
                    label="Title"
                    required
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value)
                        if (!slugTouched) setSlug(slugify(e.target.value))
                    }}
                    placeholder="e.g. Backend Engineering with Node 20"
                />
                <Input
                    label="Slug"
                    required
                    value={slug}
                    onChange={(e) => {
                        setSlug(e.target.value)
                        setSlugTouched(true)
                    }}
                    placeholder="backend-node-20"
                    hint="URL-safe — lowercase, digits, hyphens. Used in /courses/<slug> routes."
                />
                <Textarea
                    label="Description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short pitch your students will see on the catalog card."
                />
                <Input
                    label="Price (₹)"
                    type="number"
                    min={0}
                    value={priceRupees}
                    onChange={(e) => setPriceRupees(e.target.value)}
                    hint="0 makes the course free."
                />
            </div>
        </Modal>
    )
}
