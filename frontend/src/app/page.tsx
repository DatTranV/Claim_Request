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
              Process Workflow
            </h2>

            {/* Mobile View */}
            <div className="mt-8 flex flex-col space-y-4 md:hidden">
              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={PhoneIcon}
                  title="MULTI-CHANNEL CLAIM INTIMATION"
                  description="Submit claims via phone, web, or call center."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={DocumentTextIcon}
                  title="CLAIM REGISTRATION"
                  description="Claims are registered and tracked in the system."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={UsersIcon}
                  title="SEGMENTATION & ASSIGNMENT"
                  description="Claims are categorized and assigned to appropriate teams."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={ShareIcon}
                  title="REFERRALS"
                  description="Referred to investigators, surveyors, or claim adjusters."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 my-2 rotate-90" />
              </div>

              <div className="flex flex-col items-center">
                <ProcessStep
                  icon={ScaleIcon}
                  title="CLAIM ADJUDICATION"
                  description="Claims are reviewed and decisions are made."
                />
              </div>
            </div>

            {/* Desktop View */}
            <div className="mt-8 hidden md:flex md:flex-row md:items-center md:justify-center md:space-x-4">
              <div className="flex items-center">
                <ProcessStep
                  icon={PhoneIcon}
                  title="CLAIM INTIMATION"
                  description="Submit claims via phone or web."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={DocumentTextIcon}
                  title="REGISTRATION"
                  description="Register in the system."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={UsersIcon}
                  title="ASSIGNMENT"
                  description="Categorize and assign tasks."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={ShareIcon}
                  title="REFERRALS"
                  description="Refer to specialists."
                />
                <ArrowRightIcon className="h-6 w-6 text-orange-500 mx-2" />
              </div>

              <div className="flex items-center">
                <ProcessStep
                  icon={ScaleIcon}
                  title="ADJUDICATION"
                  description="Review and make decisions."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
