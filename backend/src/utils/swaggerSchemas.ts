// src/utils/swaggerSchemas.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     # --- AUTH & PASSWORD SCHEMAS ---
 *     Signup:
 *       type: object
 *       required: [firstName, lastName, email, password, role]
 *       properties:
 *         firstName: { type: string, example: "John" }
 *         lastName: { type: string, example: "Doe" }
 *         email: { type: string, format: email, example: "john.doe@example.com" }
 *         password: { type: string, format: password, description: "Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.", example: "Password123!" }
 *         role: { type: string, enum: [JOBSEEKER, JOBPROVIDER], example: "JOBSEEKER" }
 *
 *     Login:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email: { type: string, format: email, example: "jobseeker@example.com" }
 *         password: { type: string, format: password, example: "JobSeeker123!" }
 *
 *     VerifyEmail:
 *       type: object
 *       required: [userId, otp]
 *       properties:
 *         userId: { type: string, format: uuid, example: "a1b2c3d4-e5f6-7777-i9j0-k1l2m3n4o5p6" }
 *         otp: { type: string, description: "6-digit OTP from email.", example: "123456" }
 *
 *     ForgotPassword:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email, example: "jobseeker@example.com" }
 *
 *     ResetPassword:
 *       type: object
 *       required: [token, newPassword]
 *       properties:
 *         token: { type: string, description: "The password reset token from the email link." }
 *         newPassword: { type: string, format: password, example: "NewSecurePassword123!" }
 *
 *     # --- USER & EMPLOYER SCHEMAS ---
 *     UpdateProfile:
 *       type: object
 *       properties:
 *         phone: { type: string, example: "+250791234567" }
 *         desiredTitle: { type: string, description: "Job seeker's desired title.", example: "Senior Software Engineer" }
 *         about: { type: string, description: "A brief summary about the job seeker.", example: "Passionate developer..." }
 *         skills:
 *           type: array
 *           items: { type: object, properties: { category: { type: string, example: "Building" }, work: { type: string, example: "An architect" } } }
 *         jobTypes:
 *           type: array
 *           description: "For Job Providers: list of job types they offer."
 *           items: { type: string, example: "FULL_TIME" }
 *         privacy:
 *           type: object
 *           properties: { hideContact: { type: boolean, example: false } }
 *
 *     CreateEmployer:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, example: "TechCorp Inc." }
 *         website: { type: string, format: url, example: "https://techcorp.com" }
 *         industry: { type: string, example: "Technology" }
 *         location: { type: string, example: "Kigali, Rwanda" }
 *
 *     # --- JOB & APPLICATION SCHEMAS ---
 *     CreateJob:
 *       type: object
 *       required: [title, description, responsibilities, requirements, jobType, experienceLevel]
 *       properties:
 *         title: { type: string, example: "Senior Full Stack Developer" }
 *         description: { type: string, example: "We are looking for an experienced full stack developer..." }
 *         responsibilities: { type: array, items: { type: string }, example: ["Develop and maintain web apps", "Collaborate with teams"] }
 *         requirements: { type: array, items: { type: string }, example: ["5+ years of experience", "Proficiency in Node.js"] }
 *         location: { type: string, example: "Kigali, Rwanda" }
 *         remote: { type: boolean, example: true }
 *         jobType: { type: string, enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP] }
 *         experienceLevel: { type: string, enum: [ENTRY, MID, SENIOR, LEAD, EXECUTIVE] }
 *         salaryAmount: { type: number, description: "Salary amount in RWF", example: 2000000 }
 *
 *     UpdateJob:
 *       type: object
 *       properties:
 *         title: { type: string, example: "Lead Full Stack Developer" }
 *         description: { type: string, example: "Updated description..." }
 *         remote: { type: boolean, example: false }
 *
 *     ApplyToJob:
 *       type: object
 *       required: [resumeId]
 *       properties:
 *         resumeId: { type: string, format: uuid, description: "The ID of the resume to use for the application." }
 *         coverLetter: { type: string, example: "I am very interested in this position..." }
 *
 *     UpdateApplicationStatus:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [VIEWED, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, HIRED, REJECTED] }
 *         note: { type: string, example: "Candidate looks promising, scheduling an interview." }
 *
 *     # --- RESUME SCHEMAS ---
 *     RequestUpload:
 *       type: object
 *       required: [fileName, fileType, fileSize]
 *       properties:
 *         fileName: { type: string, example: "JohnDoe_Resume.pdf" }
 *         fileType: { type: string, example: "application/pdf" }
 *         fileSize: { type: number, description: "File size in bytes.", example: 102400 }
 *
 *     CompleteUpload:
 *       type: object
 *       required: [resumeId, storageKey]
 *       properties:
 *         resumeId: { type: string, format: uuid }
 *         storageKey: { type: string, description: "The public_id returned by Cloudinary." }
 *
 *     # --- GENERIC ERROR RESPONSES ---
 *     Error400:
 *       type: object
 *       properties:
 *         status: { type: string, example: "error" }
 *         message: { type: string, example: "Bad Request: Invalid input" }
 *
 *     Error401:
 *       type: object
 *       properties:
 *         status: { type: string, example: "error" }
 *         message: { type: string, example: "Unauthorized: Access token required" }
 *
 *     Error403:
 *       type: object
 *       properties:
 *         status: { type: string, example: "error" }
 *         message: { type: string, example: "Forbidden: Insufficient permissions" }
 *
 *     Error404:
 *       type: object
 *       properties:
 *         status: { type: string, example: "error" }
 *         message: { type: string, example: "Resource not found" }
 *
 *     Error422:
 *       type: object
 *       properties:
 *         status: { type: string, example: "error" }
 *         message: { type: string, example: "Validation failed" }
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field: { type: string, example: "email" }
 *               message: { type: string, example: "Invalid email" }
 */