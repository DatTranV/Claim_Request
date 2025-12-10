interface ProcessStepProps {
  icon: any;
  title: string;
  description: string;
}


export const ProcessStep = ({ icon: Icon, title, description }: ProcessStepProps) => {
  return (
    <div className="px-4 border border-orange-500 w-full md:w-40 h-42 flex flex-col items-center justify-center">
      <Icon className="h-12 w-12 text-gray-500" />
      <h3 className="mt-4 text-xs font-bold text-center">{title}</h3>
      <p className="mt-2 text-xs text-center overflow-hidden text-ellipsis">
        {description}
      </p>
    </div>
  );
};
