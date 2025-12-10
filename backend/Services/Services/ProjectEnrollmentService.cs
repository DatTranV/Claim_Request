using AutoMapper;
using BusinessObjects;
using DTOs.ProjectDTOs;
using DTOs.ProjectEnrollmentDTO;
using DTOs.ProjectEnrollmentDTOs;
using Microsoft.EntityFrameworkCore;
using Repositories.Commons;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Services
{
    public class ProjectEnrollmentService : IProjectEnrollmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentTime _currentTime;
        public ProjectEnrollmentService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentTime currentTime)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentTime = currentTime;
        }

        public async Task<ApiResult<ProjectEnrollmentResponseDTO>> AddEnrollmentAsync(ProjectEnrollmentCreateDTO enrollmentDto)
        {
            var project = await _unitOfWork.ProjectRepository.GetByIdAsync(enrollmentDto.ProjectId);
            if (project == null)
            {
                return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, "Project is not exist");
            }

            foreach (var userId in enrollmentDto.UserId.ToList())
            {
                var user = await _unitOfWork.UserRepository.GetUserByIdAsync(userId);
                if (user == null)
                {
                    return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, $"User with id {userId} is not exist");
                }
                var isUserEnrolled = await _unitOfWork.ProjectEnrollmentRepository.AnyAsync(enrollmentDto.ProjectId, userId);
                if (isUserEnrolled)
                {
                    enrollmentDto.UserId.Remove(userId);
                }
            }
            if ((enrollmentDto.ProjectRole == ProjectRole.ProjectManager
            || enrollmentDto.ProjectRole == ProjectRole.QualityAssurance)
            && enrollmentDto.UserId.Count > 1)
            {
                return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, "Project Manager and Quality Assurance can only have one user");
            }

            if (enrollmentDto.ProjectRole == ProjectRole.ProjectManager || enrollmentDto.ProjectRole == ProjectRole.QualityAssurance)
            {
                var existingEnrollment = await _unitOfWork.ProjectEnrollmentRepository.GetProjectEnrolmentByProjectAndProjectRoleAsync(project.Id, enrollmentDto.ProjectRole);
                if (existingEnrollment != null)
                {
                    return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, $"This project already have {enrollmentDto.ProjectRole}.");
                }
            }

            var enrollment = enrollmentDto.UserId.Select(u => new ProjectEnrollment
            {
                ProjectId = enrollmentDto.ProjectId,
                UserId = u,
                ProjectRole = enrollmentDto.ProjectRole,
                EnrolledDate = _currentTime.GetCurrentTime(),
                EnrollStatus = EnrollStatus.Active
            }).ToList();
            await _unitOfWork.ProjectEnrollmentRepository.AddRangeAsync(enrollment);
            await _unitOfWork.SaveChangeAsync();
            return ApiResult<ProjectEnrollmentResponseDTO>.Succeed(_mapper.Map<ProjectEnrollmentResponseDTO>(enrollmentDto), "Enroll succesfully");
        }

        public async Task<ApiResult<List<ProjectEnrollmentResponseDTO>>> GetAllEnrollmentsAsync()
        {
            var result = await _unitOfWork.ProjectEnrollmentRepository.GetAllAsync();

            return ApiResult<List<ProjectEnrollmentResponseDTO>>.Succeed(
                _mapper.Map<List<ProjectEnrollmentResponseDTO>>(result
                ), "Get all enrollments successfully");
        }

        public async Task<ApiResult<ProjectEnrollmentResponseDTO>> DeleteEnrollmentAsync(Guid id)
        {
            var enroll = await _unitOfWork.ProjectEnrollmentRepository.GetByIdAsync(id);
            if (enroll == null)
            {
                return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, "Enrollment is not exist");
            }

            var isDeleted = await _unitOfWork.ProjectEnrollmentRepository.SoftRemove(enroll);

            if (isDeleted)
            {
                enroll.ProjectRole = ProjectRole.Developer;
            await _unitOfWork.SaveChangeAsync();
            return ApiResult<ProjectEnrollmentResponseDTO>.Succeed(
                null,
                "Delete enrollment successfully");
            }
            return ApiResult<ProjectEnrollmentResponseDTO>.Error(
                null,
                "Delete Fail");
        }
        
        public async Task<ApiResult<ProjectEnrollmentResponseDTO>> GetEnrollmentByIdAsync(Guid id)
        {
            return ApiResult<ProjectEnrollmentResponseDTO>.Succeed(
                _mapper.Map<ProjectEnrollmentResponseDTO>(
                    await _unitOfWork.ProjectEnrollmentRepository.GetByIdAsync(id)
                ), "Get enrollment by id successfully");
        }

        public async Task<ApiResult<List<ProjectEnrollmentResponseDTO>>> GetEnrollmentsByProjectIdAsync(Guid projectId)
        {
            var enrollments = await _unitOfWork.ProjectEnrollmentRepository.GetQueryable()
                .Where(p => p.ProjectId == projectId)
                .Include(p => p.User)
                .ToListAsync();

            var enrollmentDtos = enrollments.Select(enrollment => new ProjectEnrollmentResponseDTO
            {
                Id = enrollment.Id,
                ProjectId = enrollment.ProjectId,
                UserId = [enrollment.UserId], 
                FullName = enrollment.User.FullName,
                Email = enrollment.User.Email,
                ProjectRole = enrollment.ProjectRole,
                EnrolledStatus = enrollment.EnrollStatus,
                CreatedAt = enrollment.EnrolledDate,
                CreatedBy = enrollment.UserId,
                IsDeleted = enrollment.IsDeleted
            }).ToList();

            return ApiResult<List<ProjectEnrollmentResponseDTO>>.Succeed(enrollmentDtos, "Get enrollments by project id successfully");
        }

        public async Task<ApiResult<List<ProjectEnrollmentResponseDTO>>> GetEnrollmentsByUserIdAsync(Guid userId)
        {

            return ApiResult<List<ProjectEnrollmentResponseDTO>>.Succeed(
                _mapper.Map<List<ProjectEnrollmentResponseDTO>>(
                    await _unitOfWork.ProjectEnrollmentRepository.GetQueryable()
                        .Where(x => x.UserId == userId)
                        .ToListAsync()
                ), "Get enrollments by user id successfully");
        }

        public async Task<ApiResult<ProjectEnrollmentResponseDTO>> UpdateEnrollmentAsync(Guid id, ProjectEnrollmentUpdateDTO enrollmentDto)
        {
            var enrollment = await _unitOfWork.ProjectEnrollmentRepository.GetByIdAsync(id);

            if (enrollment == null)
            {
                return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, "Not found enrollment!");
            }

            // Check if the new role is ProjectManager or QualityAssurance
            if (enrollmentDto.ProjectRole == ProjectRole.ProjectManager || enrollmentDto.ProjectRole == ProjectRole.QualityAssurance)
            {
                var existingEnrollment = await _unitOfWork.ProjectEnrollmentRepository.GetProjectEnrolmentByProjectAndProjectRoleAsync(enrollment.ProjectId, enrollmentDto.ProjectRole);
                if (existingEnrollment != null && existingEnrollment.UserId != enrollment.UserId)
                {
                    return ApiResult<ProjectEnrollmentResponseDTO>.Error(null, $"This project already have {enrollmentDto.ProjectRole}.");
                }
            }

            _mapper.Map(enrollmentDto, enrollment);
            await _unitOfWork.ProjectEnrollmentRepository.Update(enrollment);
            await _unitOfWork.SaveChangeAsync();

            return ApiResult<ProjectEnrollmentResponseDTO>
                .Succeed(_mapper.Map<ProjectEnrollmentResponseDTO>(enrollment), "Update successfully");
        }
    }
}
