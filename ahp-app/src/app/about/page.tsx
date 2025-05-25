'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Phương pháp phân tích thứ bậc AHP</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Sơ lược về AHP</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Phương pháp phân tích thứ bậc AHP (Analytic Hierarchy Process - AHP) là một trong những 
          phương pháp ra quyết định đa điều kiện (Multiple Criteria Decision Making) được đề xuất 
          bởi Thomas L. Saaty (1980), một nhà toán học người gốc Irắc.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          AHP là một phương pháp định lượng, dùng để đánh giá các phương án và chọn một phương án 
          thỏa mãn các tiêu chí cho trước. Thay vì yêu cầu một khối lượng dữ liệu lớn, AHP sử dụng 
          ý kiến chuyên gia và không cần quá nhiều dữ liệu để phân tích.
        </p>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Phương pháp AHP với 3 bước chính, đó là phân tích, đánh giá và tổng hợp. AHP trả lời các câu hỏi
          "Nên chọn phương án nào?" hay "Phương án nào tốt nhất?".
        </p>
      </section>
      
      <section className="mb-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Các bước thực hiện phân tích AHP</h2>
        <ol className="list-decimal pl-6 space-y-4">
          <li className="text-gray-800">
            <span className="font-medium">Xây dựng cấu trúc thứ bậc của bài toán:</span> Xác định mục tiêu (Goal), 
            các tiêu chí đánh giá (Criteria) và các phương án lựa chọn (Alternative).
          </li>
          <li className="text-gray-800">
            <span className="font-medium">Tính toán trọng số của từng tiêu chí:</span>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Xây dựng ma trận so sánh cặp cho mỗi tiêu chí</li>
              <li>Tính trọng số cho từng tiêu chí</li>
              <li>Kiểm tra tỷ số nhất quán CR (Consistency Ratio: CR&lt;10%)</li>
            </ul>
          </li>
          <li className="text-gray-800">
            <span className="font-medium">Tính mức độ ưu tiên cho từng phương án và chọn phương án tốt nhất</span>
          </li>
        </ol>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Thang điểm đánh giá của T.Saaty</h2>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-2 border border-gray-200 text-gray-700">Giá trị</th>
                <th className="px-4 py-2 border border-gray-200 text-gray-700">Mức độ quan trọng</th>
                <th className="px-4 py-2 border border-gray-200 text-gray-700">Giải thích</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">1</td>
                <td className="px-4 py-2 border border-gray-200">Quan trọng như nhau</td>
                <td className="px-4 py-2 border border-gray-200">Hai tiêu chí có mức độ quan trọng như nhau</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">3</td>
                <td className="px-4 py-2 border border-gray-200">Quan trọng vừa phải</td>
                <td className="px-4 py-2 border border-gray-200">Tiêu chí A quan trọng hơn tiêu chí B vừa phải</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">5</td>
                <td className="px-4 py-2 border border-gray-200">Quan trọng cao</td>
                <td className="px-4 py-2 border border-gray-200">Tiêu chí A quan trọng hơn tiêu chí B nhiều</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">7</td>
                <td className="px-4 py-2 border border-gray-200">Quan trọng rất cao</td>
                <td className="px-4 py-2 border border-gray-200">Tiêu chí A quan trọng hơn tiêu chí B rất nhiều</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">9</td>
                <td className="px-4 py-2 border border-gray-200">Quan trọng tuyệt đối</td>
                <td className="px-4 py-2 border border-gray-200">Tiêu chí A quan trọng hơn tiêu chí B tuyệt đối</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">2, 4, 6, 8</td>
                <td className="px-4 py-2 border border-gray-200">Giá trị trung gian</td>
                <td className="px-4 py-2 border border-gray-200">Giá trị trung gian giữa các mức trên</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-center">1/2, 1/3, ..., 1/9</td>
                <td className="px-4 py-2 border border-gray-200">Giá trị nghịch đảo</td>
                <td className="px-4 py-2 border border-gray-200">Khi so sánh tiêu chí B với A</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">Ví dụ ứng dụng AHP</h2>
        <p className="mb-4 text-gray-700 leading-relaxed">
          Phương pháp AHP đặc biệt hữu ích trong các trường hợp ra quyết định phức tạp như:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
          <li>Lựa chọn phân bổ chi tiêu khi nguồn lực có hạn</li>
          <li>So sánh các phương án đầu tư</li>
          <li>Lựa chọn sản phẩm tốt nhất dựa trên nhiều tiêu chí</li>
          <li>Ra quyết định về chiến lược phát triển</li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          Trong ứng dụng AHP Quản lý Chi tiêu Sinh viên, chúng tôi áp dụng phương pháp này để 
          giúp sinh viên đưa ra quyết định tối ưu về cách phân bổ ngân sách có hạn của mình.
        </p>
      </section>
      
      <div className="mt-8 text-center">
        <Link 
          href="/create-problem" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Bắt đầu tạo bài toán AHP
        </Link>
      </div>
    </div>
  );
}
