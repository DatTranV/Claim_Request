using AutoMapper;
using BusinessObjects;
using DTOs.ClaimDTOs;
using Repositories.Commons;
using Repositories.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class ClaimDetailService : IClaimDetailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;


        public ClaimDetailService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResult<object>> CreateNewClaimDetail(ClaimCreateDTO claimDetail)
        {
            var result = await _unitOfWork.ClaimDetailRepository.AddClaimDetailAsync(_mapper.Map<ClaimDetail>(claimDetail));
            await _unitOfWork.SaveChangeAsync();
            if (result == null)
            {
                return ApiResult<object>.Error(claimDetail, "Create failed");
            }
            return ApiResult<object>.Succeed(result, "Create successfully");
        }
    }
}
