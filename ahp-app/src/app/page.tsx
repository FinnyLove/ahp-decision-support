import Image from "next/image";
import Link from "next/link";
import { FaChartBar, FaBalanceScale, FaMoneyBillWave, FaGraduationCap } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-8 md:p-12 shadow-lg">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            AHP Quản lý Chi tiêu Sinh viên
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Ứng dụng giúp sinh viên ra quyết định chi tiêu thông minh dựa trên phương pháp phân tích thứ bậc (AHP)
          </p>
          <Link 
            href="/create-problem" 
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-full text-lg transition-colors shadow-md"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>

      {/* Features section */}
      <section className="py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          Tính năng chính
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<FaGraduationCap className="text-blue-500" size={36} />}
            title="Thiết kế cho sinh viên"
            description="Giao diện thân thiện, dễ sử dụng, được thiết kế riêng cho nhu cầu quản lý chi tiêu của sinh viên."
          />
          <FeatureCard 
            icon={<FaBalanceScale className="text-blue-500" size={36} />}
            title="So sánh phương án"
            description="So sánh các phương án chi tiêu một cách khoa học dựa trên nhiều tiêu chí khác nhau."
          />
          <FeatureCard 
            icon={<FaChartBar className="text-blue-500" size={36} />}
            title="Kết quả trực quan"
            description="Hiển thị kết quả phân tích bằng biểu đồ trực quan, dễ hiểu với các chỉ số so sánh rõ ràng."
          />
          <FeatureCard 
            icon={<FaMoneyBillWave className="text-blue-500" size={36} />}
            title="Quản lý chi tiêu"
            description="Hỗ trợ ra quyết định chi tiêu thông minh, tiết kiệm và hiệu quả cho sinh viên."
          />
        </div>
      </section>

      {/* How it works section */}
      <section className="bg-gray-50 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          Cách hoạt động
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <ol className="relative border-l border-gray-300">
            <Step 
              number={1}
              title="Xác định bài toán"
              description="Xác định mục tiêu, các tiêu chí đánh giá và các phương án lựa chọn cho bài toán chi tiêu của bạn."
            />
            <Step 
              number={2}
              title="So sánh cặp các tiêu chí"
              description="So sánh mức độ ưu tiên giữa các tiêu chí theo từng cặp để xác định trọng số của mỗi tiêu chí."
            />
            <Step 
              number={3}
              title="So sánh cặp các phương án"
              description="So sánh các phương án theo từng tiêu chí để đánh giá hiệu quả của mỗi phương án."
            />
            <Step 
              number={4}
              title="Xem kết quả phân tích"
              description="Nhận kết quả phân tích với điểm số tổng hợp và biểu đồ trực quan, giúp bạn đưa ra quyết định tối ưu."
              isLast={true}
            />
          </ol>
        </div>

        <div className="text-center mt-10">
          <Link 
            href="/about" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Tìm hiểu thêm về AHP
          </Link>
        </div>
      </section>
    </div>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Step = ({ 
  number, 
  title, 
  description, 
  isLast = false 
}: { 
  number: number; 
  title: string; 
  description: string; 
  isLast?: boolean 
}) => (
  <li className={`ml-6 ${!isLast ? 'mb-10' : ''}`}>
    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full -left-4 ring-4 ring-white text-white font-bold">
      {number}
    </span>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </li>
);
