using BusinessObjects;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace Services.Download
{
    public class ClaimExcelExporter
    {
        public async Task<MemoryStream> ExportClaimsAsync(IEnumerable<ClaimRequest> claims)
        {
            if (claims == null)
            {
                throw new ArgumentNullException(nameof(claims));
            }

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Sheet1");

            // ** Thêm tiêu đề tổng thể **
            var currentMonthYear = DateTime.UtcNow.ToString("MM/yyyy");
            worksheet.Cells["A1"].Value = $"Claim request for {currentMonthYear}";
            worksheet.Cells["A1:G1"].Merge = true;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.Font.Size = 14;
            worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            // ** Thiết lập tiêu đề cột ở hàng 3 **
            var headers = new[] { "Claim ID", "Staff Name", "Department", "Project Name",
            "Project Duration", "Total working hour", "" };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cells[3, i + 1];
                cell.Value = headers[i];
                cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                cell.Style.Fill.BackgroundColor.SetColor(Color.Navy);
                cell.Style.Font.Color.SetColor(Color.White);
                cell.Style.Font.Bold = true;
                cell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }

            // ** Điền dữ liệu claim từ hàng 4 trở đi **
            long total = 0;
            int row = 4;
            foreach (var claim in claims)
            {
                worksheet.Cells[row, 1].Value = claim.Id;
                worksheet.Cells[row, 2].Value = claim.Creator?.FullName;
                worksheet.Cells[row, 3].Value = claim.Creator?.Department;
                worksheet.Cells[row, 4].Value = claim.Project?.ProjectName;
                worksheet.Cells[row, 5].Value = $"{claim.Project.StartDate.ToString("MM/yyyy")} - {claim.Project.EndDate.Date.ToString("MM/yyyy")}";
                worksheet.Cells[row, 6].Value = claim.TotalWorkingHours;
                worksheet.Cells[row, 7].Style.Numberformat.Format = "#,##0.00"; // Format số tiền
                worksheet.Cells[row, 7].Value = claim.TotalClaimAmount;
                row++;
                total += claim.TotalClaimAmount;
            }

            worksheet.Cells[row, 1, row, 6].Merge = true; // Gộp cột 1-5 cho "Total"
            worksheet.Cells[row, 1].Value = "Total:";
            worksheet.Cells[row, 1].Style.Font.Bold = true;
            worksheet.Cells[row, 1].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Right;

            // Tính tổng Total Claim Amount
            worksheet.Cells[row, 7].Value = total;
            worksheet.Cells[row, 7].Style.Numberformat.Format = "#,##0.00"; // Định dạng số tiền
            worksheet.Cells[row, 7].Style.Font.Bold = true;

            worksheet.Cells[row, 1, row, 7].Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            worksheet.Cells[row, 1, row, 7].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightYellow);

            // Auto-fit columns
            worksheet.Cells.AutoFitColumns();

            // Lưu vào MemoryStream
            var stream = new MemoryStream();
            package.SaveAs(stream);
            stream.Position = 0;
            return stream;
        }
    }
}
