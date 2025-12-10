using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.ProjectDTOs;
using DTOs.ProjectEnrollmentDTO;
using DTOs.ProjectEnrollmentDTOs;
using DTOs.UserDTOs;

namespace Services.Mapper
{
    public class MapperConfigProfile : Profile
    {
        public MapperConfigProfile()
        {
            //User Mappings
            CreateMap<User, UserDetailsDTO>().ReverseMap();
            CreateMap<User, StaffConfigDTO>().ReverseMap();
            CreateMap<User, UserRegisterDTO>().ReverseMap();
            CreateMap<User, StaffCreateDTO>().ReverseMap();
            CreateMap<User, UserChangePasswordDTO>().ReverseMap();

            CreateMap<StaffCreateDTO, UserDetailsDTO>().ReverseMap();
            //Claim Request mapping
            CreateMap<ClaimRequest, ClaimCreateDTO>().ReverseMap();
            CreateMap<ClaimRequest, ClaimResponseDTO>().ReverseMap();
            CreateMap<ClaimDetail, ClaimCreateDTO>().ReverseMap();
            CreateMap<ClaimDetail, ClaimDetailDTO>().ReverseMap();
            CreateMap<ClaimDetail, ClaimDetailResponseDTO>().ReverseMap();
            CreateMap<ClaimRequest, ClaimResponseDTO>()
                .ForMember(dest => dest.StaffName, opt => opt.MapFrom(src => src.Creator.FullName))
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.ProjectName))
                .ForMember(dest => dest.StartDate, opt => opt.MapFrom(src => src.Project.StartDate))
                .ForMember(dest => dest.EndDate, opt => opt.MapFrom(src => src.Project.EndDate));
            CreateMap<ClaimRequest, ClaimToUpdateDTO>();
            CreateMap<ClaimToUpdateDTO, ClaimRequest>()
                .ForMember(dest => dest.ClaimDetails, opt => opt.Ignore());
            CreateMap<ClaimRequest, ResponseCreatedClaimDTO>().ReverseMap();
            //CreateMap<ProjectEnrollment, ProjectEnrollmentDTO>().ReverseMap();

            CreateMap<AuditTrail, AuditTrailDTO>().ReverseMap();

            //Project Mapping
            CreateMap<Project, ProjectDetailsDTO>().ReverseMap();
            CreateMap<Project, ProjectCreateDTO>().ReverseMap();
            CreateMap<Project, ProjectUpdateDTO>().ReverseMap();

            // Project Enrollment Mapping
            CreateMap<ProjectEnrollmentResponseDTO, ProjectEnrollmentCreateDTO>().ReverseMap();
            CreateMap<ProjectEnrollmentResponseDTO, ProjectEnrollmentUpdateDTO>().ReverseMap();
            CreateMap<ProjectEnrollment, ProjectEnrollmentCreateDTO>().ReverseMap();
            CreateMap<ProjectEnrollment, ProjectEnrollmentUpdateDTO>().ReverseMap();
            CreateMap<ProjectEnrollment, ProjectEnrollmentResponseDTO>()
                .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => new List<Guid> { src.UserId }));
            //CreateMap<ProjectEnrollmentResponseDTO, ProjectEnrollment>()
            //    .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId != null && src.UserId.Any() ? src.UserId.First() : Guid.Empty));

            CreateMap<AuditTrail, AuditTrailResponse>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName));
            CreateMap<AuditTrail, AuditTrailResponseV2>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.User.FullName));
            CreateMap<AuditTrailDTO, AuditTrailResponseV2>().ReverseMap();
        }
    }
}
