import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <>
      <h1 className="text-4xl font-bold ">Claim Request System</h1>
      <p className="mt-4 ml-4 mr-4 text-lg ">
        The Claim Request System streamlines and automates the insurance claims
        process. It allows policyholders to easily submit claims, track their
        status, and communicate with insurers. It also provides insurers with
        efficient tools to manage the entire workflow—from initial notification
        to final settlement—ensuring speed, transparency, and customer
        satisfaction.
      </p>
      <button
        className={cn(
          "mt-8 px-8 py-2 bg-orange-500 text-white font-semibold rounded-lg",
          "transition duration-300 ease-in-out hover:bg-orange-950"
        )}
      >
        Get Started
      </button>
    </>
  );
}
