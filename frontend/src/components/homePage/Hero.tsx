import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <>
      <h1 className="text-4xl font-bold ">Claim Request System</h1>
      <p className="mt-4 text-lg ">
        Hệ thống Claim Request tối ưu hóa quy trình xử lý yêu cầu bồi thường của
        nhân viên, bao gồm theo dõi, phê duyệt và thanh toán bồi
        thường.
      </p>
      <button
        className={cn(
          "mt-8 px-8 py-2 bg-orange-500 text-white font-semibold rounded-lg",
          "transition duration-300 ease-in-out hover:bg-orange-950"
        )}
      >
        Tìm hiểu thêm
      </button>
    </>
  );
}
