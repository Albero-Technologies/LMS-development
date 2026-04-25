import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, BookOpen, ArrowRight, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@features/dashboards/components/PageHeader'
import { Card } from '@shared/components/ui/Card'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Textarea } from '@shared/components/ui/Input'
import { Badge } from '@shared/components/ui/Badge'
import { Empty } from '@shared/components/ui/Empty'
import { Modal } from '@shared/components/ui/Modal'
import { useCourseStore } from '../stores/courseStore'
import { useAuthStore } from '@shared/stores/authStore'
import { ROLES } from '@shared/constants/roles'
import { StudentCoursesView } from '../components/StudentCoursesView'

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

    return <AdminCoursesView />
}

const AdminCoursesView = () => {
    const [q, setQ] = useState('')
    const [newOpen, setNewOpen] = useState(false)

    const user = useAuthStore((s) => s.user)
    const canEdit = user && [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.TRAINER].includes(user.role as never)

    const courses = useCourseStore((s) => s.courses)

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase()
        if (!needle) return courses
        return courses.filter((c) => c.title.toLowerCase().includes(needle) || c.slug.includes(needle))
    }, [courses, q])

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

            {filtered.length === 0 && (
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
            )}

            {filtered.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((c) => (
                        <Card
                            key={c.id}
                            className="flex flex-col">
                            <div
                                className="h-32 rounded-md mb-4 relative overflow-hidden grid-dots"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-brand-50), var(--color-surface-2))'
                                }}>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <BookOpen
                                        size={36}
                                        className="text-[var(--color-brand-500)]/60"
                                    />
                                </div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold text-fg truncate">{c.title}</h3>
                                    <p className="text-xs text-fg-muted mt-1 font-mono">/{c.slug}</p>
                                </div>
                                <Badge tone={c.isPublished ? 'ok' : 'default'}>{c.isPublished ? 'Live' : 'Draft'}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-fg-soft line-clamp-2">{c.description}</p>
                            <div className="mt-3 flex items-center justify-between text-sm text-fg-soft">
                                <span className="font-mono font-semibold">₹{c.price.toLocaleString('en-IN')}</span>
                                <span className="text-xs text-fg-muted">{c.enrolledCount} enrolled</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <Link
                                    to={`/app/courses/${c.id}`}
                                    className="flex-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full"
                                        rightIcon={<ArrowRight size={14} />}>
                                        View
                                    </Button>
                                </Link>
                                {canEdit && (
                                    <Link to={`/app/courses/${c.id}/builder`}>
                                        <Button
                                            variant="subtle"
                                            size="icon"
                                            aria-label="Edit curriculum">
                                            <Wrench size={14} />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
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

const NewCourseModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const upsert = useCourseStore((s) => s.upsertCourse)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('4999')

    const reset = () => {
        setTitle('')
        setDescription('')
        setPrice('4999')
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const id = slugify(title) || crypto.randomUUID().slice(0, 8)
        upsert({
            id,
            title: title.trim(),
            slug: id,
            description: description.trim(),
            price: Number(price) || 0,
            isPublished: false,
            enrolledCount: 0,
            sections: []
        })
        toast.success('Course created — add your first lesson.')
        reset()
        onClose()
        // Send the user straight to the builder.
        window.setTimeout(() => {
            window.location.assign(`/app/courses/${id}/builder`)
        }, 50)
    }

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
                        form="new-course-form"
                        type="submit"
                        disabled={title.trim().length < 2}>
                        Create & open builder
                    </Button>
                </>
            }>
            <form
                id="new-course-form"
                onSubmit={submit}
                className="space-y-4">
                <Input
                    label="Title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Backend Engineering with Node 20"
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
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
            </form>
        </Modal>
    )
}
