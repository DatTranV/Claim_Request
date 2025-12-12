# Claim Request System

![.NET CI/CD](https://github.com/DatTranV/Claim_Request/workflows/.NET%20CI%2FCD/badge.svg)
[![codecov](https://codecov.io/gh/DatTranV/Claim_Request/branch/main/graph/badge.svg)](https://codecov.io/gh/DatTranV/Claim_Request)

A comprehensive full-stack claim request management system built with modern architecture and best practices. This system enables organizations to manage employee expense claims, track approval workflows, and maintain audit trails.

## Overview

The Claim Request System is designed to streamline the process of submitting, reviewing, and processing expense claims within an organization. It provides role-based access control, automated email notifications, and comprehensive reporting capabilities.

### Key Features

- **Claim Management**: Create, update, submit, approve, reject, and process expense claims
- **Workflow Management**: Multi-stage approval process with status tracking (Draft, Pending Approval, Approved, Paid, Rejected, Cancelled)
- **Project Management**: Associate claims with projects and manage project enrollments
- **User Management**: Staff configuration and role-based access control
- **Email Notifications**: Automated email alerts for claim status changes
- **Audit Trail**: Complete history of all claim-related activities
- **Reporting**: Export claims to Excel format for financial reporting
- **Search and Filtering**: Advanced filtering and pagination for claim lists

## Tech Stack

### Backend

- **.NET 8.0**: Modern C# framework for building scalable APIs
- **Entity Framework Core 9.0**: ORM for database operations
- **SQL Server**: Relational database management system
- **JWT Authentication**: Secure token-based authentication
- **AutoMapper**: Object-to-object mapping
- **Quartz.NET**: Background job scheduling for email reminders
- **MailKit**: Email sending capabilities
- **xUnit**: Unit testing framework
- **FakeItEasy/Moq/NSubstitute**: Mocking frameworks for testing

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **TanStack Query**: Data fetching and caching
- **Zustand**: Lightweight state management
- **React Hook Form**: Form state management

## Project Structure

```
├── backend/                    # .NET API Backend
│   ├── WebAPI/                # API Controllers, Middleware, and Configuration
│   ├── Services/              # Business Logic Layer
│   │   ├── Services/         # Service implementations
│   │   ├── Interfaces/        # Service interfaces
│   │   ├── Gmail/            # Email service implementation
│   │   └── Download/         # Excel export functionality
│   ├── Repositories/         # Data Access Layer
│   │   ├── Repositories/     # Repository implementations
│   │   ├── Interfaces/       # Repository interfaces
│   │   ├── Commons/          # Shared utilities and helpers
│   │   └── Migrations/        # Entity Framework migrations
│   ├── BusinessObjects/      # Domain Models and Entities
│   ├── DTOs/                 # Data Transfer Objects
│   │   ├── ClaimDTOs/        # Claim-related DTOs
│   │   ├── UserDTOs/         # User-related DTOs
│   │   ├── ProjectDTOs/      # Project-related DTOs
│   │   └── AuditTrailDTOs/   # Audit trail DTOs
│   └── Test/                 # Unit Tests
│       ├── ClaimTestFixture/ # Test fixtures for claim tests
│       └── EmailTest/        # Email service tests
│
└── frontend/                  # Next.js Frontend Application
    ├── src/
    │   ├── app/              # Next.js App Router pages and routes
    │   ├── components/       # Reusable React components
    │   ├── services/         # API service clients
    │   ├── store/            # Zustand state stores
    │   ├── hooks/            # Custom React hooks
    │   └── types/            # TypeScript type definitions
    └── public/               # Static assets
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (or SQL Server Express)
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Restore NuGet packages:
```bash
dotnet restore
```

3. Update the database connection string in `WebAPI/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your SQL Server connection string"
  }
}
```

4. Run Entity Framework migrations:
```bash
dotnet ef database update --project Repositories --startup-project WebAPI
```

5. Run the API:
```bash
cd WebAPI
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000` (depending on your configuration).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (if needed):
```bash
# Create .env.local file with your API endpoint
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Testing

### Backend Tests

Run all unit tests:
```bash
cd backend
dotnet test
```

Run tests with coverage:
```bash
dotnet test --collect:"XPlat Code Coverage" --results-directory coverage
```

Run tests in a specific project:
```bash
dotnet test Test/Test.csproj
```

### Frontend Linting

Run ESLint:
```bash
cd frontend
npm run lint
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/change-password` - Change password

### Claims
- `GET /api/claims` - Get paginated list of claims
- `GET /api/claims/{id}` - Get claim by ID
- `POST /api/claims` - Create new claim
- `PUT /api/claims/{id}` - Update claim
- `POST /api/claims/{id}/submit` - Submit claim for approval
- `POST /api/claims/{id}/approve` - Approve claim
- `POST /api/claims/{id}/reject` - Reject claim
- `POST /api/claims/{id}/return` - Return claim for revision
- `POST /api/claims/{id}/cancel` - Cancel claim
- `POST /api/claims/bulk-approve` - Approve multiple claims
- `POST /api/claims/bulk-paid` - Mark multiple claims as paid
- `POST /api/claims/download` - Export claims to Excel

### Projects
- `GET /api/projects` - Get list of projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `GET /api/projects/{id}` - Get project details

### Users/Staff
- `GET /api/staff` - Get list of staff members
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/{id}` - Update staff member
- `GET /api/staff/{id}` - Get staff details

### Audit Trail
- `GET /api/audit-trail` - Get audit trail records

## Architecture

### Backend Architecture

The backend follows a layered architecture pattern:

1. **WebAPI Layer**: Controllers handle HTTP requests and responses
2. **Services Layer**: Business logic and orchestration
3. **Repositories Layer**: Data access and persistence
4. **BusinessObjects Layer**: Domain models and entities
5. **DTOs Layer**: Data transfer objects for API contracts

### Design Patterns

- **Repository Pattern**: Abstracts data access logic
- **Unit of Work Pattern**: Manages database transactions
- **Dependency Injection**: Loose coupling and testability
- **DTO Pattern**: Separates internal models from API contracts

## Database Schema

### Main Entities

- **User**: System users and staff members
- **Role**: User roles and permissions
- **Project**: Projects that claims can be associated with
- **ProjectEnrollment**: User-project relationships
- **ClaimRequest**: Main claim entity
- **ClaimDetail**: Individual line items within a claim
- **AuditTrail**: History of all claim-related actions

## CI/CD

The project includes GitHub Actions workflows for:

- Automated builds on push to main/develop branches
- Running unit tests
- Publishing test results
- Code coverage reporting via Codecov

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Submit a pull request

## License

This project is proprietary and confidential.

## Contact

For questions or support, please contact the development team.
