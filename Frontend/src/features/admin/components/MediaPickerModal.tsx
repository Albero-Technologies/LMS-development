// Media picker — opens from any image-bearing field in the website editor.
// Two affordances:
//   1. Upload tab: drop or pick a file → uploads via /media/upload → returns
//      the new asset's URL.
//   2. Library tab: grid of every existing image in the tenant's library;
//      click to select, hover to delete.
//
// `onPick(url)` is called with the public URL the editor should write into
// its data field.
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, Image as ImageIcon, Trash2, Library, FileUp } from 'lucide-react'
import { Modal } from '@shared/components/ui/Modal'
import { Button } from '@shared/components/ui/Button'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { Empty } from '@shared/components/ui/Empty'
import { cn } from '@shared/helpers/cn'
import { deleteMedia, listMedia, uploadMedia, type MediaAsset } from '../services/media.service'

type Tab = 'library' | 'upload'

interface Props {
    open: boolean
    onClose: () => void
    onPick: (url: string) => void
}

export const MediaPickerModal = ({ open, onClose, onPick }: Props) => {
    const queryClient = useQueryClient()
    const [tab, setTab] = useState<Tab>('library')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    const libraryQuery = useQuery({
        queryKey: ['media', 'library'],
        queryFn: () => listMedia({ mime: 'image/' }),
        enabled: open,
        staleTime: 30_000
    })

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadMedia(file, { kind: 'media' }),
        onSuccess: (asset) => {
            toast.success('Uploaded — pick it from the library')
            void queryClient.invalidateQueries({ queryKey: ['media', 'library'] })
            // Auto-select right after upload — most users expect this.
            onPick(asset.url)
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Upload failed')
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteMedia(id),
        onSuccess: () => {
            toast.success('Removed from library')
            void queryClient.invalidateQueries({ queryKey: ['media', 'library'] })
        },
        onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Could not delete')
    })

    const handleFile = (file: File | null | undefined) => {
        if (!file) return
        if (!file.type.startsWith('image/')) {
            toast.error('Please pick an image (PNG / JPG / WebP / GIF / SVG)')
            return
        }
        uploadMutation.mutate(file)
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Media library"
            description="Pick an image from your library or upload a new one."
            size="lg">
            <div className="flex border-b border-[var(--color-border)] mb-4 -mx-5 px-5">
                <button
                    type="button"
                    onClick={() => setTab('library')}
                    className={cn(
                        'px-3 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2',
                        tab === 'library' ? 'border-[var(--color-brand-500)] text-[var(--color-brand-600)]' : 'border-transparent text-fg-muted hover:text-fg'
                    )}>
                    <Library size={14} /> Library ({libraryQuery.data?.length ?? 0})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('upload')}
                    className={cn(
                        'px-3 py-2 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-2',
                        tab === 'upload' ? 'border-[var(--color-brand-500)] text-[var(--color-brand-600)]' : 'border-transparent text-fg-muted hover:text-fg'
                    )}>
                    <FileUp size={14} /> Upload
                </button>
            </div>

            {tab === 'library' && (
                <>
                    {libraryQuery.isLoading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <Skeleton
                                    key={i}
                                    className="aspect-square"
                                />
                            ))}
                        </div>
                    ) : (libraryQuery.data?.length ?? 0) === 0 ? (
                        <Empty
                            icon={<ImageIcon size={32} />}
                            title="No media yet"
                            description="Upload your first image — it'll be available across every page in the editor."
                            action={
                                <Button
                                    leftIcon={<Upload size={14} />}
                                    onClick={() => setTab('upload')}>
                                    Upload now
                                </Button>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[480px] overflow-y-auto -mx-2 px-2">
                            {libraryQuery.data?.map((asset) => (
                                <AssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onPick={() => onPick(asset.url)}
                                    onDelete={() => {
                                        if (window.confirm('Remove this asset from the library?')) deleteMutation.mutate(asset.id)
                                    }}
                                    isDeleting={deleteMutation.isPending && deleteMutation.variables === asset.id}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {tab === 'upload' && (
                <div>
                    <label
                        htmlFor="media-upload-input"
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragOver(true)
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault()
                            setDragOver(false)
                            handleFile(e.dataTransfer.files?.[0])
                        }}
                        className={cn(
                            'block rounded-md border-2 border-dashed p-12 text-center cursor-pointer transition-colors',
                            dragOver
                                ? 'border-[var(--color-brand-500)] bg-[var(--color-brand-50)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-brand-500)]'
                        )}>
                        <Upload
                            size={32}
                            className="mx-auto mb-3 text-fg-muted"
                        />
                        <p className="text-sm font-medium text-fg">Drop an image here, or click to choose</p>
                        <p className="text-xs text-fg-muted mt-1">PNG, JPG, WebP, GIF, SVG · up to 10 MB</p>
                        {uploadMutation.isPending && (
                            <p className="text-xs text-[var(--color-brand-500)] mt-3">Uploading…</p>
                        )}
                    </label>
                    <input
                        ref={fileInputRef}
                        id="media-upload-input"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                </div>
            )}
        </Modal>
    )
}

const AssetCard = ({
    asset,
    onPick,
    onDelete,
    isDeleting
}: {
    asset: MediaAsset
    onPick: () => void
    onDelete: () => void
    isDeleting: boolean
}) => (
    <div className="group relative aspect-square rounded-md border border-[var(--color-border)] overflow-hidden bg-surface-2">
        <button
            type="button"
            onClick={onPick}
            className="absolute inset-0 hover:opacity-90"
            aria-label={`Pick ${asset.originalName}`}>
            <img
                src={asset.url}
                alt={asset.altText ?? asset.originalName}
                loading="lazy"
                className="w-full h-full object-cover"
            />
        </button>
        <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label="Delete"
            className="absolute top-1 right-1 p-1 rounded bg-bg/90 text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--color-danger)] disabled:opacity-50">
            <Trash2 size={12} />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
            {asset.originalName}
        </div>
    </div>
)
