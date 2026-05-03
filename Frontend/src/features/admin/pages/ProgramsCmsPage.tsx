import { CmsPage } from './CmsPage'

// Focused programs editor — wraps the generic CmsPage but locked to the
// `programs` collection so admins land directly on the items table for
// /programs/:slug pages on the public site. Everything else (schema, items,
// publish/unpublish, tenant picker for SUPER_ADMIN) flows through the
// existing CMS infrastructure unchanged.
export const ProgramsCmsPage = () => (
    <CmsPage
        lockedCollectionSlug="programs"
        headerEyebrow="Public site"
        headerTitle="Programs"
        headerDescription="Career-track program landing pages on the marketing site. Editing a row updates /programs/:slug — pricing still flows from the matching Course row."
    />
)
