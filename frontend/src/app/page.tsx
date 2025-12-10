import Hero from "@/components/homePage/Hero";
import { ProcessStep } from "@/components/homePage/ProcessStep";
import {
  DocumentTextIcon,
  PhoneIcon,
  ScaleIcon,
  ShareIcon,
  UsersIcon,
} from "@heroicons/react/16/solid";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export default function HomePage() {
  return (
    <>
      <div className="container mx-auto px-4 ">
        <div className="rounded-md shadow-md">
          {/* Phần Hero */}
          <div className="py-6 md:py-8 text-center">
            <Hero />
          </div>

          <div className="py-6 md:py-8 px-2 md:px-4">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
              Quy trình hoạt động
            </h2>

            {/* Mobile View */}
            <div className="mt-8 flex flex-col space-y-4 md:hidden">
              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={PhoneIcon}
                  title="MULTI-CHANNEL CLAIM INTIMATION"
                  description="Nộp yêu cầu qua điện thoại, web hoặc trung tâm cuộc gọi."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={DocumentTextIcon}
                  title="CLAIM REGISTRATION"
                  description="Yêu cầu được đăng ký và theo dõi trong hệ thống."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={UsersIcon}
                  title="SEGMENTATION & ASSIGNMENT"
                  description="Yêu cầu được phân loại và giao cho nhóm phù hợp."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={ShareIcon}
                  title="REFERRALS"
                  description="Chuyển tiếp đến các chuyên viên điều tra, khảo sát hoặc chấp lý yêu cầu."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={ScaleIcon}
                  title="CLAIM ADJUDICATION"
                  description="Yêu cầu được xem xét và đưa ra quyết định."
                />
              </div>
            </div>

            {/* Desktop View */}
            <div className="mt-8 hidden md:flex md:flex-row md:items-center md:justify-center md:space-x-4">
              <div className="flex items-center">
                <ProcessStep
                  icon={PhoneIcon}
                  title="CLAIM INTIMATION"
                  description="Nộp yêu cầu qua điện thoại, web."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={DocumentTextIcon}
                  title="REGISTRATION"
                  description="Đăng ký trong hệ thống."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={UsersIcon}
                  title="ASSIGNMENT"
                  description="Phân loại và giao việc."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={ShareIcon}
                  title="REFERRALS"
                  description="Chuyển đến chuyên viên."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={ScaleIcon}
                  title="ADJUDICATION"
                  description="Xem xét và quyết định."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}