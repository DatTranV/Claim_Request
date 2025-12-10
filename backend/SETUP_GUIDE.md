# Hướng dẫn Setup Dự án - Claim Request System

## 📋 Yêu cầu

- .NET SDK 6.0 hoặc cao hơn
- SQL Server
- Visual Studio 2022 hoặc VS Code

## 🚀 Các bước cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd backend
```

### 2. Cấu hình Database

- Tạo file `appsettings.Development.json` từ file mẫu:
  ```bash
  copy WebAPI\appsettings.sample.json WebAPI\appsettings.Development.json
  ```

- Mở file `appsettings.Development.json` và cập nhật thông tin database:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=ClaimRequestDB;User Id=YOUR_USERNAME;Password=YOUR_PASSWORD;TrustServerCertificate=True"
  }
  ```

### 3. Cấu hình JWT

- Trong `appsettings.Development.json`, thay đổi `JwtSettings`:
  ```json
  "JwtSettings": {
    "SecretKey": "your-secret-key-at-least-32-characters-long",
    "Issuer": "ClaimRequestAPI",
    "Audience": "ClaimRequestClient",
    "ExpirationInMinutes": 60
  }
  ```
  
  **Lưu ý:** `SecretKey` phải dài ít nhất 32 ký tự

### 4. Cấu hình Email (Nếu sử dụng tính năng gửi email)

- Cập nhật `EmailSettings` trong `appsettings.Development.json`:
  ```json
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "Port": 587,
    "SenderEmail": "your-email@gmail.com",
    "SenderPassword": "your-app-password",
    "SenderName": "Claim Request System"
  }
  ```

  **Lưu ý cho Gmail:** 
  - Bật xác thực 2 bước
  - Tạo App Password tại: https://myaccount.google.com/apppasswords

### 5. Restore packages và chạy Migration

```bash
# Restore NuGet packages
dotnet restore

# Chạy migration để tạo database
dotnet ef database update --project Repositories --startup-project WebAPI
```

### 6. Chạy ứng dụng

```bash
cd WebAPI
dotnet run
```

Ứng dụng sẽ chạy tại: `https://localhost:7xxx` hoặc `http://localhost:5xxx`

## 📁 Cấu trúc dự án

- **BusinessObjects**: Chứa các entity models
- **DTOs**: Data Transfer Objects
- **Repositories**: Database context, migrations, và repositories
- **Services**: Business logic
- **WebAPI**: API controllers và middleware
- **Test**: Unit tests

## 🔐 Thông tin quan trọng

- **KHÔNG** commit file `appsettings.Development.json` lên Git
- File này chứa thông tin nhạy cảm (connection string, secrets)
- Sử dụng file `appsettings.sample.json` làm template

## 🧪 Chạy Tests

```bash
dotnet test
```

## 📞 Hỗ trợ

Nếu gặp vấn đề trong quá trình setup, vui lòng liên hệ team leader hoặc tạo issue.
