# CI/CD Setup Guide

## GitHub Actions Workflow

Dự án này đã được cấu hình CI/CD sử dụng GitHub Actions để tự động build và test code khi push lên GitHub.

### Cấu hình hiện tại

File workflow: `.github/workflows/dotnet-ci.yml`

**Workflow sẽ chạy khi:**
- Push code lên branch `main` hoặc `develop`
- Tạo Pull Request vào branch `main` hoặc `develop`

**Các bước thực hiện:**
1. ✅ Checkout code
2. ✅ Setup .NET 8.0
3. ✅ Restore dependencies
4. ✅ Build solution (Release mode)
5. ✅ Run tests
6. ✅ Generate test reports
7. ✅ Collect code coverage
8. ✅ Upload coverage reports

### Badges cho README

Thêm các badges sau vào README.md chính của dự án:

```markdown
![.NET CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/.NET%20CI%2FCD/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO_NAME)
```

*Lưu ý: Thay thế `YOUR_USERNAME` và `YOUR_REPO_NAME` bằng thông tin repository thực tế của bạn.*

### Code Coverage

#### Setup Codecov (tùy chọn)

1. Truy cập [codecov.io](https://codecov.io/) và đăng nhập bằng GitHub
2. Thêm repository của bạn
3. Không cần thêm token vì workflow đã được cấu hình sẵn

#### Xem Coverage Locally

```bash
# Chạy test với coverage
dotnet test --collect:"XPlat Code Coverage"

# Cài đặt ReportGenerator (nếu chưa có)
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coveragereport" -reporttypes:Html

# Mở file coveragereport/index.html trong browser
```

### Tùy chỉnh Workflow

Nếu muốn thay đổi branches trigger workflow, sửa file `.github/workflows/dotnet-ci.yml`:

```yaml
on:
  push:
    branches: [ main, develop, feature/* ]  # Thêm branch patterns
  pull_request:
    branches: [ main, develop ]
```

### Requirements

- .NET 8.0 SDK
- Test project đã có package `coverlet.collector` và `coverlet.msbuild`
- GitHub repository với Actions được enable

### Kiểm tra Workflow

1. Push code lên GitHub:
   ```bash
   git add .
   git commit -m "Add CI/CD workflow"
   git push origin main
   ```

2. Xem kết quả tại: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions`

### Troubleshooting

**Nếu build fail:**
- Kiểm tra logs trong GitHub Actions tab
- Đảm bảo solution build thành công trên local: `dotnet build backend.sln`

**Nếu tests fail:**
- Chạy tests trên local: `dotnet test backend.sln`
- Kiểm tra test dependencies và configurations

**Nếu coverage không hiển thị:**
- Đảm bảo đã setup Codecov repository
- Kiểm tra coverage files được generate: `dotnet test --collect:"XPlat Code Coverage"`
