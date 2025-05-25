'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AHPProblem, Alternative, Criterion } from '@/types/ahp';
import { FaArrowLeft, FaArrowRight, FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

export default function AlternativesPage() {
  const router = useRouter();
  const [problem, setProblem] = useState<AHPProblem | null>(null);
  const [criteriaWeights, setCriteriaWeights] = useState<number[] | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Tải dữ liệu bài toán từ localStorage
    const problemData = localStorage.getItem('ahpProblemData');
    const weightsData = localStorage.getItem('ahpCriteriaWeights');
    
    if (problemData && weightsData) {
      try {
        const parsedProblem = JSON.parse(problemData) as AHPProblem;
        const parsedWeights = JSON.parse(weightsData) as number[];
        
        setProblem(parsedProblem);
        setCriteriaWeights(parsedWeights);
        
        // Nếu đã có các phương án trong bài toán, sử dụng chúng
        if (parsedProblem.alternatives && parsedProblem.alternatives.length > 0) {
          setAlternatives(parsedProblem.alternatives);
        } else {
          // Bắt đầu với 2 phương án trống
          setAlternatives([
            { id: uuidv4(), name: '', description: '' },
            { id: uuidv4(), name: '', description: '' }
          ]);
        }
      } catch (err) {
        setError('Có lỗi khi tải dữ liệu bài toán.');
      }
    } else {
      setError('Không tìm thấy dữ liệu bài toán hoặc trọng số tiêu chí. Vui lòng thực hiện các bước trước.');
    }
  }, []);

  // Thêm phương án mới
  const addAlternative = () => {
    setAlternatives([...alternatives, { id: uuidv4(), name: '', description: '' }]);
  };

  // Cập nhật phương án
  const updateAlternative = (id: string, field: keyof Alternative, value: string) => {
    setAlternatives(alternatives.map(alt => 
      alt.id === id ? { ...alt, [field]: value } : alt
    ));
  };

  // Xóa phương án
  const removeAlternative = (id: string) => {
    if (alternatives.length > 2) {
      setAlternatives(alternatives.filter(alt => alt.id !== id));
    } else {
      alert('Bài toán cần có ít nhất hai phương án!');
    }
  };

  // Xử lý khi tiếp tục
  const handleContinue = () => {
    // Kiểm tra xem tất cả các phương án có tên không
    const emptyNames = alternatives.some(alt => !alt.name.trim());
    if (emptyNames) {
      alert('Vui lòng nhập tên cho tất cả các phương án.');
      return;
    }

    if (!problem) {
      setError('Không tìm thấy dữ liệu bài toán.');
      return;
    }

    // Cập nhật bài toán với các phương án mới
    const updatedProblem = {
      ...problem,
      alternatives
    };
    
    // Lưu vào localStorage
    localStorage.setItem('ahpProblemData', JSON.stringify(updatedProblem));
    
    // Chuyển đến trang so sánh phương án theo tiêu chí
    router.push('/alternatives-comparison');
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Lỗi</h2>
        <p className="text-red-600">{error}</p>
        <div className="mt-4">
          <Link href="/create-problem" className="inline-block px-4 py-2 mr-2 bg-blue-600 text-white rounded-md">
            Quay lại tạo bài toán
          </Link>
          <Link href="/comparison" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md">
            Quay lại so sánh tiêu chí
          </Link>
        </div>
      </div>
    );
  }

  if (!problem || !criteriaWeights) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">{problem.title}</h1>
      <p className="text-gray-600 mb-6">{problem.description}</p>
      
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">Nhập các phương án chi tiêu</h3>
            <p className="text-blue-700 mb-2">
              Nhập các phương án chi tiêu mà bạn đang cân nhắc. Mỗi phương án nên có tên rõ ràng 
              và mô tả chi tiết để dễ dàng so sánh ở các bước tiếp theo.
            </p>
            <p className="text-blue-700">
              <strong>Ví dụ phương án chi tiêu:</strong> "Mua laptop mới", "Tham gia khóa học", "Tiết kiệm", "Du lịch"...
            </p>
          </div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4 text-gray-800">Các phương án chi tiêu</h2>
      
      {alternatives.map((alternative, index) => (
        <div key={alternative.id} className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200 relative">
          <div className="mb-4 grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`alternative-name-${index}`} className="block mb-2 font-medium text-gray-700">
                Tên phương án {index + 1}
              </label>
              <input
                id={`alternative-name-${index}`}
                type="text"
                value={alternative.name}
                onChange={(e) => updateAlternative(alternative.id, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: Mua laptop mới, Tham gia khóa học..."
              />
            </div>
            
            <div>
              <label htmlFor={`alternative-desc-${index}`} className="block mb-2 font-medium text-gray-700">
                Mô tả phương án
              </label>
              <input
                id={`alternative-desc-${index}`}
                type="text"
                value={alternative.description}
                onChange={(e) => updateAlternative(alternative.id, 'description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả chi tiết về phương án này, chi phí dự kiến, lợi ích..."
              />
            </div>
          </div>
          
          {alternatives.length > 2 && (
            <button
              type="button"
              onClick={() => removeAlternative(alternative.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 flex items-center"
            >
              <FaTrash className="mr-1" /> Xóa phương án này
            </button>
          )}
        </div>
      ))}
      
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={addAlternative}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaPlus className="mr-2" /> Thêm phương án mới
        </button>
      </div>
      
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-3 text-gray-800">Tóm tắt trọng số các tiêu chí</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-2 border border-gray-200">Tiêu chí</th>
                <th className="px-4 py-2 border border-gray-200">Trọng số</th>
              </tr>
            </thead>
            <tbody>
              {problem.criteria.map((criterion, index) => (
                <tr key={criterion.id}>
                  <td className="px-4 py-2 border border-gray-200">{criterion.name}</td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    {criteriaWeights[index].toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <p className="mt-4 text-gray-600 text-sm">
          <strong>Lưu ý:</strong> Trọng số các tiêu chí đã được tính toán từ ma trận so sánh cặp ở bước trước.
          Ở bước tiếp theo, bạn sẽ so sánh các phương án theo từng tiêu chí.
        </p>
      </div>
      
      <div className="flex justify-between mt-8">
        <Link 
          href="/comparison"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Quay lại
        </Link>
        
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tiếp tục đến so sánh phương án <FaArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
}
