# Claim Request System

![.NET CI/CD](https://github.com/DatTranV/Claim_Request/workflows/.NET%20CI%2FCD/badge.svg)
[![codecov](https://codecov.io/gh/DatTranV/Claim_Request/branch/main/graph/badge.svg)](https://codecov.io/gh/DatTranV/Claim_Request)

Hệ thống quản lý yêu cầu thanh toán (Claim Request) được xây dựng với kiến trúc Full-Stack hiện đại.

## 📋 Tổng quan

Dự án bao gồm:
- **Backend**: RESTful API được xây dựng bằng .NET 8.0
- **Frontend**: Web application được xây dựng bằng Next.js 15 và React 19

## 🛠️ Tech Stack

### Backend
- .NET 8.0
- Entity Framework Core
- SQL Server
- JWT Authentication
- xUnit Testing

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand

## 🚀 Cài đặt nhanh

### Backend

```bash
cd backend
dotnet restore
dotnet ef database update --project Repositories --startup-project WebAPI
cd WebAPI
dotnet run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc dự án

```
├── backend/              # .NET API Backend
│   ├── WebAPI/          # API Controllers & Middleware
│   ├── Services/         # Business Logic
│   ├── Repositories/     # Data Access Layer
│   ├── BusinessObjects/  # Entity Models
│   ├── DTOs/            # Data Transfer Objects
│   └── Test/            # Unit Tests
│
└── frontend/            # Next.js Frontend
    ├── src/
    │   ├── app/         # Next.js App Router
    │   ├── components/  # React Components
    │   ├── services/    # API Services
    │   └── store/       # State Management
    └── public/          # Static Assets
```

## 🧪 Chạy Tests

```bash
# Backend tests
cd backend
dotnet test

# Frontend linting
cd frontend
npm run lint
```

