// Hand-authored OpenAPI 3.1 document for Phase 1.
// Keep in sync with module routers. Exposed at /api/v1/docs (Swagger UI)
// and /api/v1/openapi.json (raw JSON).

import config from '../config/config'

const spec = {
    openapi: '3.1.0',
    info: {
        title: 'LearnHub LMS API',
        version: '1.0.0',
        description: 'Multi-tenant LMS backend — Phase 1 (MVP). All endpoints except auth and webhooks require a Bearer JWT.',
        contact: { name: 'LearnHub Engineering', email: 'eng@learnhub.in' }
    },
    servers: [{ url: `${config.SERVER_URL}/api/v1`, description: config.ENV }],
    tags: [
        { name: 'Auth', description: 'Login, register, refresh, Google OAuth, invite accept' },
        { name: 'Tenants', description: 'Tenant create + branding' },
        { name: 'Users', description: 'User CRUD + invitations' },
        { name: 'Courses', description: 'Course + section + lesson management, progress' },
        { name: 'Enrollments', description: 'Enrolment, Razorpay, invoices' },
        { name: 'Quizzes', description: 'MCQ quizzes + attempts' },
        { name: 'Batches', description: 'Batch CRUD + student assignment' },
        { name: 'Leads', description: 'Counsellor pipeline (Kanban)' },
        { name: 'Tickets', description: 'Support ticketing' },
        { name: 'Notifications', description: 'In-app notification inbox' },
        { name: 'Dashboard', description: 'Per-role dashboard aggregates' },
        { name: 'Uploads', description: 'Multer file uploads' },
        { name: 'Webhooks', description: 'Razorpay + Zoho Books callbacks' },
        { name: 'Ops', description: 'Health, metrics, self' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            refreshCookie: { type: 'apiKey', in: 'cookie', name: 'refresh_token' }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    statusCode: { type: 'integer' },
                    code: { type: 'string', example: 'VALIDATION_ERROR' },
                    message: { type: 'string' },
                    details: { nullable: true }
                }
            },
            Success: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    statusCode: { type: 'integer' },
                    message: { type: 'string' },
                    data: {}
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    tenantId: { type: 'string', format: 'uuid' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'STUDENT', 'COUNSELLOR', 'SUPPORT', 'CLIENT'] },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'SUSPENDED'] }
                }
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 1 },
                    tenantSlug: { type: 'string' }
                }
            },
            RegisterInput: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'tenantSlug'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    phone: { type: 'string' },
                    tenantSlug: { type: 'string' }
                }
            },
            Course: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    price: { type: 'integer', description: 'Amount in smallest currency unit (paise)' },
                    currency: { type: 'string', example: 'INR' },
                    gstPercent: { type: 'integer', example: 18 },
                    publishState: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] }
                }
            },
            CreateCourseInput: {
                type: 'object',
                required: ['title', 'slug', 'price'],
                properties: {
                    title: { type: 'string', minLength: 3 },
                    slug: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]*$' },
                    description: { type: 'string' },
                    price: { type: 'integer', minimum: 0 },
                    currency: { type: 'string', default: 'INR' },
                    gstPercent: { type: 'integer', minimum: 0, maximum: 28, default: 18 },
                    trainerId: { type: 'string', format: 'uuid' },
                    tags: { type: 'array', items: { type: 'string' } }
                }
            },
            EnrollmentStart: {
                type: 'object',
                required: ['courseId'],
                properties: {
                    courseId: { type: 'string', format: 'uuid' },
                    batchId: { type: 'string', format: 'uuid' }
                }
            },
            VerifyPaymentInput: {
                type: 'object',
                required: ['razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature'],
                properties: {
                    razorpayOrderId: { type: 'string' },
                    razorpayPaymentId: { type: 'string' },
                    razorpaySignature: { type: 'string' }
                }
            },
            QuizSubmit: {
                type: 'object',
                required: ['answers'],
                properties: {
                    answers: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['questionId', 'selectedIds'],
                            properties: {
                                questionId: { type: 'string', format: 'uuid' },
                                selectedIds: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    }
                }
            },
            UploadedFile: {
                type: 'object',
                properties: {
                    filename: { type: 'string' },
                    originalName: { type: 'string' },
                    mimetype: { type: 'string' },
                    size: { type: 'integer' },
                    url: { type: 'string' }
                }
            }
        },
        responses: {
            Unauthorized: { description: 'Missing or invalid token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            Forbidden:    { description: 'Role or tenant policy denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            NotFound:     { description: 'Resource not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            Validation:   { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        // ---- Ops ----
        '/health': {
            get: {
                tags: ['Ops'],
                summary: 'Service + DB liveness probe',
                security: [],
                responses: { '200': { description: 'Healthy' }, '503': { description: 'Unhealthy' } }
            }
        },
        '/metrics': {
            get: { tags: ['Ops'], summary: 'Prometheus text metrics', security: [], responses: { '200': { description: 'OK' } } }
        },
        '/self': {
            get: { tags: ['Ops'], summary: 'Service identity', security: [], responses: { '200': { description: 'OK' } } }
        },

        // ---- Auth ----
        '/auth/register': {
            post: {
                tags: ['Auth'], summary: 'Register a student into a tenant', security: [],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
                responses: { '201': { description: 'Registered' }, '400': { $ref: '#/components/responses/Validation' } }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'], summary: 'Log in with email + password', security: [],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
                responses: { '200': { description: 'OK' }, '401': { $ref: '#/components/responses/Unauthorized' } }
            }
        },
        '/auth/refresh': {
            post: { tags: ['Auth'], summary: 'Rotate refresh token → new access token', security: [{ refreshCookie: [] }], responses: { '200': { description: 'OK' } } }
        },
        '/auth/logout': { post: { tags: ['Auth'], summary: 'Revoke refresh session', responses: { '200': { description: 'OK' } } } },
        '/auth/me':     { get:  { tags: ['Auth'], summary: 'Decoded current user', responses: { '200': { description: 'OK' } } } },
        '/auth/google': { get:  { tags: ['Auth'], summary: 'Begin Google OAuth flow', security: [], responses: { '302': { description: 'Redirect to Google' } } } },
        '/auth/google/callback': { get: { tags: ['Auth'], summary: 'Google OAuth callback', security: [], responses: { '200': { description: 'OK' } } } },
        '/auth/invites/accept': {
            post: {
                tags: ['Auth'], summary: 'Accept role invitation and set password', security: [],
                responses: { '200': { description: 'Accepted' }, '400': { $ref: '#/components/responses/Validation' } }
            }
        },

        // ---- Tenants ----
        '/tenants': {
            post: { tags: ['Tenants'], summary: 'Create a tenant + first admin (SUPER_ADMIN)', responses: { '201': { description: 'Created' } } }
        },
        '/tenants/me': {
            get:   { tags: ['Tenants'], summary: 'My tenant', responses: { '200': { description: 'OK' } } },
            patch: { tags: ['Tenants'], summary: 'Update branding / settings', responses: { '200': { description: 'Updated' } } }
        },

        // ---- Users ----
        '/users': { get: { tags: ['Users'], summary: 'List users', responses: { '200': { description: 'OK' } } } },
        '/users/invites': {
            post: { tags: ['Users'], summary: 'Invite a user by email with a role', responses: { '201': { description: 'Invited' } } }
        },
        '/users/{id}': {
            get:    { tags: ['Users'], summary: 'Get user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
            patch:  { tags: ['Users'], summary: 'Update user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Updated' } } },
            delete: { tags: ['Users'], summary: 'Soft-delete user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }
        },

        // ---- Courses ----
        '/courses': {
            get:  { tags: ['Courses'], summary: 'List courses', responses: { '200': { description: 'OK' } } },
            post: {
                tags: ['Courses'], summary: 'Create a course',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCourseInput' } } } },
                responses: { '201': { description: 'Created' } }
            }
        },
        '/courses/{id}': {
            get:    { tags: ['Courses'], summary: 'Get course', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
            patch:  { tags: ['Courses'], summary: 'Update course', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } },
            delete: { tags: ['Courses'], summary: 'Soft-delete course', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } }
        },
        '/courses/{id}/sections': { post: { tags: ['Courses'], summary: 'Add a section', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },
        '/courses/{id}/lessons':  { post: { tags: ['Courses'], summary: 'Add a lesson', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },
        '/courses/{id}/lessons/{lessonId}/progress': {
            post: {
                tags: ['Courses'], summary: 'Update student progress for a lesson',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { '200': { description: 'OK' } }
            }
        },

        // ---- Enrollments ----
        '/enrollments': {
            post: {
                tags: ['Enrollments'], summary: 'Start enrollment + create Razorpay order',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/EnrollmentStart' } } } },
                responses: { '201': { description: 'Order created' } }
            },
            get: { tags: ['Enrollments'], summary: 'Admin list', responses: { '200': { description: 'OK' } } }
        },
        '/enrollments/mine': { get: { tags: ['Enrollments'], summary: 'My enrollments', responses: { '200': { description: 'OK' } } } },
        '/enrollments/verify-payment': {
            post: {
                tags: ['Enrollments'], summary: 'Verify Razorpay Checkout handshake',
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPaymentInput' } } } },
                responses: { '200': { description: 'Paid' }, '400': { $ref: '#/components/responses/Validation' } }
            }
        },

        // ---- Quizzes ----
        '/quizzes':           { post: { tags: ['Quizzes'], summary: 'Create a quiz', responses: { '201': { description: 'Created' } } } },
        '/quizzes/{id}':      { get:  { tags: ['Quizzes'], summary: 'Get quiz', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
        '/quizzes/{id}/attempts': { post: { tags: ['Quizzes'], summary: 'Start an attempt', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'OK' } } } },
        '/quizzes/attempts/{attemptId}/submit': {
            post: {
                tags: ['Quizzes'], summary: 'Submit attempt answers',
                parameters: [{ name: 'attemptId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/QuizSubmit' } } } },
                responses: { '200': { description: 'Graded' } }
            }
        },
        '/quizzes/attempts/mine': { get: { tags: ['Quizzes'], summary: 'My attempts', responses: { '200': { description: 'OK' } } } },

        // ---- Batches / Leads / Tickets / Notifications / Dashboard (brief) ----
        '/batches': { get: { tags: ['Batches'], summary: 'List batches', responses: { '200': { description: 'OK' } } }, post: { tags: ['Batches'], summary: 'Create batch', responses: { '201': { description: 'Created' } } } },
        '/batches/{id}/students':   { post: { tags: ['Batches'], summary: 'Assign students', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
        '/batches/{id}/transfer':   { post: { tags: ['Batches'], summary: 'Transfer student to another batch', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

        '/leads':                   { get: { tags: ['Leads'], summary: 'List leads', responses: { '200': { description: 'OK' } } }, post: { tags: ['Leads'], summary: 'Create lead', responses: { '201': { description: 'Created' } } } },
        '/leads/{id}/stage':        { post: { tags: ['Leads'], summary: 'Move lead stage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
        '/leads/{id}/interactions': { post: { tags: ['Leads'], summary: 'Log a call / note', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },

        '/tickets':                 { get: { tags: ['Tickets'], summary: 'List tickets', responses: { '200': { description: 'OK' } } }, post: { tags: ['Tickets'], summary: 'Create ticket', responses: { '201': { description: 'Created' } } } },
        '/tickets/{id}':            { patch: { tags: ['Tickets'], summary: 'Update (staff)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },
        '/tickets/{id}/comments':   { post: { tags: ['Tickets'], summary: 'Add comment', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Created' } } } },

        '/notifications':           { get: { tags: ['Notifications'], summary: 'My inbox', responses: { '200': { description: 'OK' } } } },
        '/notifications/{id}/read': { post: { tags: ['Notifications'], summary: 'Mark read', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' } } } },

        '/dashboard/me': { get: { tags: ['Dashboard'], summary: 'Per-role stats + next actions', responses: { '200': { description: 'OK' } } } },

        // ---- Uploads ----
        '/uploads/avatars': {
            post: {
                tags: ['Uploads'], summary: 'Upload an avatar (2MB image)',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Uploaded',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadedFile' } } }
                    }
                }
            }
        },
        '/uploads/course-thumbnails': { post: { tags: ['Uploads'], summary: 'Course thumbnail (5MB image)', responses: { '201': { description: 'OK' } } } },
        '/uploads/branding':          { post: { tags: ['Uploads'], summary: 'Tenant branding logo (2MB image)', responses: { '201': { description: 'OK' } } } },
        '/uploads/ticket-attachments': {
            post: {
                tags: ['Uploads'], summary: 'Up to 5 files (10MB each, any type)',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } }
                        }
                    }
                },
                responses: { '201': { description: 'OK' } }
            }
        },
        '/uploads/assignments': { post: { tags: ['Uploads'], summary: 'Assignment submission (25MB doc)', responses: { '201': { description: 'OK' } } } },

        // ---- Webhooks ----
        '/webhooks/razorpay':   { post: { tags: ['Webhooks'], summary: 'Razorpay payment callback (HMAC verified)', security: [], responses: { '200': { description: 'OK' } } } },
        '/webhooks/zoho-books': { post: { tags: ['Webhooks'], summary: 'Zoho Books invoice callback (shared secret)', security: [], responses: { '200': { description: 'OK' } } } }
    }
}

export default spec
