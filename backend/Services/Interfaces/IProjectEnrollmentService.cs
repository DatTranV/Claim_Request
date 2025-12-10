using DTOs.ProjectEnrollmentDTO;
using DTOs.ProjectEnrollmentDTOs;
using Repositories.Commons;

namespace Services.Interfaces
{
    public interface IProjectEnrollmentService
    {
        Task<ApiResult<ProjectEnrollmentResponseDTO>> GetEnrollmentByIdAsync(Guid id);
        Task<ApiResult<List<ProjectEnrollmentResponseDTO>>> GetEnrollmentsByUserIdAsync(Guid userId);
        Task<ApiResult<List<ProjectEnrollmentResponseDTO>>> GetEnrollmentsByProjectIdAsync(Guid projectId);
        Task<ApiResult<ProjectEnrollmentResponseDTO>> AddEnrollmentAsync(ProjectEnrollmentCreateDTO enrollmentDto);
        Task<ApiResult<ProjectEnrollmentResponseDTO>> UpdateEnrollmentAsync(Guid id, ProjectEnrollmentUpdateDTO enrollmentDto);
        Task<ApiResult<ProjectEnrollmentResponseDTO>> DeleteEnrollmentAsync(Guid id);
    }
}
