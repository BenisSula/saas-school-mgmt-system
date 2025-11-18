# API Usage Documentation

Complete guide to all API endpoints in the SaaS School Management System.

## Table of Contents

- [Authentication](#authentication)
- [Base URL & Headers](#base-url--headers)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth-endpoints)
  - [Users](#users-endpoints)
  - [Students](#students-endpoints)
  - [Teachers](#teachers-endpoints)
  - [Attendance](#attendance-endpoints)
  - [Exams](#exams-endpoints)
  - [Grades](#grades-endpoints)
  - [Results](#results-endpoints)
  - [Fees & Invoices](#fees--invoices-endpoints)
  - [Reports](#reports-endpoints)
  - [Configuration](#configuration-endpoints)
  - [Superuser](#superuser-endpoints)
  - [Health](#health-endpoints)

---

## Authentication

All protected endpoints require authentication via JWT tokens.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "tenant-uuid" // Optional if tenantName provided
  // OR
  "tenantName": "school-slug" // Optional if tenantId provided
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "admin",
    "status": "active",
    "tenantId": "tenant-uuid"
  }
}
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "role": "student", // student | teacher | admin
  "tenantId": "tenant-uuid",
  "profile": {
    // Role-specific profile data
  }
}
```

### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Base URL & Headers

**Base URL:** `http://localhost:3001` (development)

**Required Headers:**
```http
Authorization: Bearer <access_token>
x-tenant-id: <tenant-id>
Content-Type: application/json
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "field": "fieldName" // Optional, for validation errors
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## Endpoints

### Auth Endpoints

#### POST /auth/login
Authenticate user and receive tokens.

**Required Permissions:** None (public)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "tenantId": "string (optional)",
  "tenantName": "string (optional)"
}
```

#### POST /auth/register
Register new user account.

**Required Permissions:** None (public)

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "student | teacher | admin",
  "tenantId": "string",
  "profile": "object (role-specific)"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Required Permissions:** None (authenticated)

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

#### POST /auth/logout
Logout user and invalidate tokens.

**Required Permissions:** Authenticated

#### POST /auth/verify-email
Request email verification.

**Required Permissions:** Authenticated

**Request Body:**
```json
{
  "email": "string"
}
```

#### POST /auth/reset-password/request
Request password reset.

**Required Permissions:** None (public)

**Request Body:**
```json
{
  "email": "string"
}
```

#### POST /auth/reset-password
Reset password with token.

**Required Permissions:** None (public)

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

---

### Users Endpoints

#### GET /users
List all users for current tenant.

**Required Permissions:** `users:manage`

**Query Parameters:**
- `status`: `pending | active | suspended | rejected` (optional)
- `role`: `student | teacher | admin | superadmin` (optional)
- `page`: `number` (optional, default: 1)
- `limit`: `number` (optional, default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "role": "string",
      "status": "string",
      "created_at": "ISO8601"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /users/register
Admin creates new user with profile.

**Required Permissions:** `users:manage`

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "role": "student | teacher",
  "fullName": "string",
  "gender": "male | female | other (optional)",
  "address": "string (optional)",
  // Student fields
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "parentGuardianName": "string (optional)",
  "parentGuardianContact": "string (optional)",
  "studentId": "string (optional)",
  "classId": "string (optional)",
  // Teacher fields
  "phone": "string (optional)",
  "qualifications": "string (optional)",
  "yearsOfExperience": "number (optional)",
  "subjects": ["string"] (optional),
  "teacherId": "string (optional)"
}
```

#### PATCH /users/:userId/role
Update user role.

**Required Permissions:** `users:manage`

**Request Body:**
```json
{
  "role": "student | teacher | admin | superadmin"
}
```

#### PATCH /users/:userId/approve
Approve pending user.

**Required Permissions:** `users:manage`

**Response:**
```json
{
  "id": "uuid",
  "status": "active",
  "updated_at": "ISO8601"
}
```

#### PATCH /users/:userId/reject
Reject pending user.

**Required Permissions:** `users:manage`

---

### Students Endpoints

#### GET /students
List all students.

**Required Permissions:** `users:manage`

**Query Parameters:**
- `classId`: `string` (optional)
- `page`: `number` (optional)
- `limit`: `number` (optional)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "string",
      "last_name": "string",
      "date_of_birth": "YYYY-MM-DD",
      "class_id": "string",
      "admission_number": "string",
      "parent_contacts": []
    }
  ],
  "pagination": {}
}
```

#### GET /students/:id
Get student by ID.

**Required Permissions:** `users:manage`

#### POST /students
Create new student.

**Required Permissions:** `users:manage`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "YYYY-MM-DD (optional)",
  "classId": "string (optional)",
  "admissionNumber": "string (optional)",
  "parentContacts": [
    {
      "name": "string",
      "relationship": "string",
      "phone": "string"
    }
  ]
}
```

#### PUT /students/:id
Update student.

**Required Permissions:** `users:manage`

#### DELETE /students/:id
Delete student.

**Required Permissions:** `users:manage`

#### GET /students/:id/roster
Get student class roster.

**Required Permissions:** Own roster or `users:manage`

---

### Teachers Endpoints

#### GET /teachers
List all teachers.

**Required Permissions:** `users:manage`

**Query Parameters:**
- `page`: `number` (optional)
- `limit`: `number` (optional)

#### GET /teachers/:id
Get teacher by ID.

**Required Permissions:** `users:manage`

#### POST /teachers
Create new teacher.

**Required Permissions:** `users:manage`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "subjects": ["string"],
  "assignedClasses": ["string"]
}
```

#### PUT /teachers/:id
Update teacher.

**Required Permissions:** `users:manage`

#### DELETE /teachers/:id
Delete teacher.

**Required Permissions:** `users:manage`

---

### Attendance Endpoints

#### POST /attendance/mark
Bulk mark attendance.

**Required Permissions:** `attendance:manage`

**Request Body:**
```json
{
  "records": [
    {
      "studentId": "uuid",
      "classId": "string",
      "status": "present | absent | late",
      "markedBy": "uuid",
      "date": "YYYY-MM-DD",
      "metadata": {}
    }
  ]
}
```

#### GET /attendance/:studentId
Get student attendance history.

**Required Permissions:** Own attendance or `students:manage`

**Query Parameters:**
- `from`: `YYYY-MM-DD` (optional)
- `to`: `YYYY-MM-DD` (optional)

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "student_id": "uuid",
      "class_id": "string",
      "status": "string",
      "attendance_date": "YYYY-MM-DD",
      "recorded_at": "ISO8601"
    }
  ],
  "summary": {
    "total": 100,
    "present": 85,
    "absent": 10,
    "late": 5,
    "attendance_rate": 0.85
  }
}
```

#### GET /attendance/report/class
Get class attendance report for date.

**Required Permissions:** `attendance:manage`

**Query Parameters:**
- `class_id`: `string` (required)
- `date`: `YYYY-MM-DD` (required)

**Response:**
```json
{
  "class_id": "string",
  "date": "YYYY-MM-DD",
  "total_students": 30,
  "present": 25,
  "absent": 3,
  "late": 2,
  "records": []
}
```

---

### Exams Endpoints

#### GET /exams
List all exams.

**Required Permissions:** `exams:view`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "exam_date": "YYYY-MM-DD",
    "metadata": {}
  }
]
```

#### POST /exams
Create new exam.

**Required Permissions:** `exams:manage`

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)",
  "examDate": "YYYY-MM-DD",
  "metadata": {}
}
```

#### GET /exams/grade-scales
Get grade scales.

**Required Permissions:** `exams:view`

#### POST /exams/:examId/sessions
Create exam session.

**Required Permissions:** `exams:manage`

**Request Body:**
```json
{
  "classId": "string",
  "subject": "string",
  "scheduledAt": "ISO8601",
  "invigilator": "string (optional)"
}
```

---

### Grades Endpoints

#### POST /grades/bulk
Bulk grade entry.

**Required Permissions:** `grades:manage`

**Request Body:**
```json
{
  "examId": "uuid",
  "entries": [
    {
      "studentId": "uuid",
      "subject": "string",
      "score": 85,
      "remarks": "string (optional)",
      "classId": "string"
    }
  ]
}
```

**Response:**
```json
{
  "saved": 30
}
```

---

### Results Endpoints

#### GET /results/:studentId
Get exam results for student.

**Required Permissions:** Own results or `exams:view`

**Query Parameters:**
- `exam_id`: `uuid` (required)

**Response:**
```json
{
  "exam": {
    "id": "uuid",
    "name": "string",
    "exam_date": "YYYY-MM-DD"
  },
  "summary": {
    "studentId": "uuid",
    "total": 450,
    "average": 90,
    "percentage": 90,
    "grade": "A",
    "position": 5
  },
  "subjects": [
    {
      "subject": "string",
      "score": 90,
      "grade": "A",
      "remarks": "string"
    }
  ],
  "aggregates": {
    "highest": 500,
    "lowest": 200,
    "classAverage": 85
  },
  "leaderboard": []
}
```

#### GET /results/:examId/export
Export exam results.

**Required Permissions:** `exams:view`

**Query Parameters:**
- `format`: `csv | pdf` (optional, default: csv)

---

### Fees & Invoices Endpoints

#### POST /invoices
Create invoice for student.

**Required Permissions:** `fees:manage`

**Request Body:**
```json
{
  "studentId": "uuid",
  "dueDate": "ISO8601",
  "currency": "USD",
  "items": [
    {
      "description": "string",
      "amount": 100.00,
      "metadata": {}
    }
  ],
  "metadata": {}
}
```

#### GET /invoices/:studentId
List invoices for student.

**Required Permissions:** Own invoices or `fees:manage`

**Response:**
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "total_amount": 100.00,
    "paid_amount": 50.00,
    "status": "partial",
    "due_date": "ISO8601",
    "items": []
  }
]
```

#### POST /payments
Payment webhook endpoint.

**Required Permissions:** Authenticated (webhook)

**Request Body:**
```json
{
  "provider": "string",
  "type": "string",
  "paymentId": "string",
  "invoiceId": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "metadata": {}
}
```

---

### Reports Endpoints

#### GET /reports/attendance
Get attendance summary report.

**Required Permissions:** `attendance:manage`

**Query Parameters:**
- `from`: `YYYY-MM-DD` (optional)
- `to`: `YYYY-MM-DD` (optional)
- `class_id`: `string` (optional)

**Response:**
```json
[
  {
    "attendance_date": "YYYY-MM-DD",
    "class_id": "string",
    "status": "present | absent | late",
    "count": 25
  }
]
```

#### GET /reports/grades
Get grade distribution for exam.

**Required Permissions:** `exams:view`

**Query Parameters:**
- `exam_id`: `uuid` (required)

**Response:**
```json
[
  {
    "subject": "string",
    "grade": "A",
    "count": 10,
    "average_score": 90.5
  }
]
```

#### GET /reports/fees
Get outstanding fee summary.

**Required Permissions:** `fees:manage`

**Query Parameters:**
- `status`: `pending | partial | paid | overdue | refunded` (optional)

**Response:**
```json
[
  {
    "status": "pending",
    "invoice_count": 50,
    "total_amount": 5000.00,
    "total_paid": 0.00
  }
]
```

#### GET /reports/department-analytics
Get department analytics.

**Required Permissions:** `users:view`

**Query Parameters:**
- `department_id`: `string` (optional)

---

### Configuration Endpoints

#### GET /configuration/branding
Get tenant branding configuration.

**Required Permissions:** `settings:branding`

**Response:**
```json
{
  "logo_url": "https://example.com/logo.png",
  "primary_color": "#2563eb",
  "secondary_color": "#0f172a",
  "theme_flags": {
    "gradients": true
  },
  "typography": {},
  "navigation": {}
}
```

#### PUT /configuration/branding
Update tenant branding.

**Required Permissions:** `settings:branding`

**Request Body:**
```json
{
  "logoUrl": "string (optional)",
  "primaryColor": "string (optional)",
  "secondaryColor": "string (optional)",
  "themeFlags": {} (optional),
  "typography": {} (optional),
  "navigation": {} (optional)
}
```

#### GET /configuration/terms
List academic terms.

**Required Permissions:** `settings:terms`

#### POST /configuration/terms
Create or update academic term.

**Required Permissions:** `settings:terms`

**Request Body:**
```json
{
  "name": "string",
  "startsOn": "YYYY-MM-DD",
  "endsOn": "YYYY-MM-DD"
}
```

#### GET /configuration/classes
List classes.

**Required Permissions:** `settings:classes`

#### POST /configuration/classes
Create or update class.

**Required Permissions:** `settings:classes`

**Request Body:**
```json
{
  "name": "string",
  "description": "string (optional)"
}
```

#### GET /school
Get school profile.

**Required Permissions:** `school:manage`

#### PUT /school
Update school profile.

**Required Permissions:** `school:manage`

**Request Body:**
```json
{
  "name": "string",
  "address": {}
}
```

---

### Superuser Endpoints

All superuser endpoints require `tenants:manage` permission.

#### GET /superuser/overview
Get platform overview.

**Response:**
```json
{
  "total_tenants": 50,
  "active_tenants": 45,
  "total_users": 1000,
  "total_schools": 50
}
```

#### GET /superuser/schools
List all schools.

#### POST /superuser/schools
Create new school.

**Request Body:**
```json
{
  "name": "string",
  "slug": "string",
  "address": {},
  "adminEmail": "string",
  "adminPassword": "string",
  "adminName": "string"
}
```

#### PATCH /superuser/schools/:id
Update school.

#### DELETE /superuser/schools/:id
Soft delete school.

#### POST /superuser/schools/:id/admins
Create admin for school.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

#### GET /superuser/users
List all platform users.

#### POST /superuser/notifications
Send notification to admins.

**Request Body:**
```json
{
  "subject": "string",
  "message": "string",
  "tenantIds": ["uuid"] (optional)
}
```

#### GET /superuser/analytics/tenant/:tenantId
Get tenant analytics.

#### GET /superuser/usage
Get usage monitoring.

**Query Parameters:**
- `tenantId`: `uuid` (optional)

---

### Health Endpoints

#### GET /health
Health check endpoint.

**Required Permissions:** None (public)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "ISO8601"
}
```

---

## Rate Limiting

- **General API:** 100 requests per minute
- **Write Operations:** 50 requests per minute
- **Admin Actions:** 20 requests per minute
- **Auth Endpoints:** 5 requests per minute

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Tenant Isolation

All endpoints automatically scope data to the tenant specified in the `x-tenant-id` header. Users can only access data from their assigned tenant.

---

## Best Practices

1. **Always include required headers** (Authorization, x-tenant-id)
2. **Handle errors gracefully** - Check status codes and error messages
3. **Use pagination** for large datasets
4. **Cache responses** when appropriate
5. **Validate input** before sending requests
6. **Refresh tokens** before they expire
7. **Respect rate limits** - Implement exponential backoff

