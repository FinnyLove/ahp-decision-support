'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { 
  AHPMode, 
  AHPProblem, 
  Criterion, 
  Alternative, 
  DEFAULT_STUDENT_CRITERIA 
} from '@/types/ahp';
import { FaInfoCircle, FaPlus, FaTrash } from 'react-icons/fa';

export default function CreateProblemPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<AHPMode | null>(null);
  
  // Thông tin bài toán
  const [problemTitle, setProblemTitle] = useState('Chi tiêu sinh viên');
  const [problemDescription, setProblemDescription] = useState('Phân tích các phương án chi tiêu tối ưu');
  
  // Tiêu chí và phương án
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  // Xử lý khi chọn chế độ
  const handleModeSelect = (selectedMode: AHPMode) => {
    setMode(selectedMode);
    
    if (selectedMode === 'student-expense') {
      // Sử dụng tiêu chí mặc định cho chi tiêu sinh viên
      setCriteria(DEFAULT_STUDENT_CRITERIA);
      setStep(2); // Chuyển đến bước so sánh tiêu chí
    } else if (selectedMode === 'custom') {
      // Tạo bài toán với tiêu chí tùy chỉnh
      setCriteria([
        { id: uuidv4(), name: '', description: '' }
      ]);
      setStep(1); // Chuyển đến bước nhập thông tin bài toán
    } else if (selectedMode === 'ai-assisted') {
      // Hiện tại chuyển sang chế độ tùy chỉnh và thông báo
      alert('Tính năng tạo với AI sẽ được phát triển trong tương lai. Bạn sẽ được chuyển sang chế độ tùy chỉnh.');
      setCriteria([
        { id: uuidv4(), name: '', description: '' }
      ]);
      setStep(1); // Chuyển đến bước nhập thông tin bài toán
    }
  };

  // Thêm tiêu chí mới
  const addCriterion = () => {
    setCriteria([...criteria, { id: uuidv4(), name: '', description: '' }]);
  };

  // Cập nhật tiêu chí
  const updateCriterion = (id: string, field: keyof Criterion, value: string) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // Xóa tiêu chí
  const removeCriterion = (id: string) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter(c => c.id !== id));
    } else {
      alert('Bài toán cần có ít nhất một tiêu chí!');
    }
  };

  // Thêm phương án mới
  const addAlternative = () => {
    setAlternatives([...alternatives, { id: uuidv4(), name: '', description: '' }]);
  };

  // Cập nhật phương án
  const updateAlternative = (id: string, field: keyof Alternative, value: string) => {
    setAlternatives(alternatives.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  // Xóa phương án
  const removeAlternative = (id: string) => {
    if (alternatives.length > 1) {
      setAlternatives(alternatives.filter(a => a.id !== id));
    } else {
      alert('Bài toán cần có ít nhất một phương án!');
    }
  };

  // Xử lý khi tiếp tục từ bước nhập thông tin bài toán
  const handleInfoContinue = () => {
    // Kiểm tra xem tất cả các tiêu chí có tên không
    const emptyNames = criteria.some(c => !c.name.trim());
    if (emptyNames) {
      alert('Vui lòng nhập tên cho tất cả các tiêu chí.');
      return;
    }

    // Lưu thông tin bài toán vào localStorage
    const problem: AHPProblem = {
      id: uuidv4(),
      title: problemTitle,
      description: problemDescription,
      criteria,
      alternatives: [],
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('ahpProblemData', JSON.stringify(problem));
    setStep(2); // Chuyển đến bước so sánh tiêu chí
  };

  // Render các bước khác nhau
  const renderStep = () => {
    switch (step) {
      case 0:
        return renderModeSelection();
      case 1:
        return renderProblemInfo();
      case 2:
        return renderCriteriaInput();
      case 3:
        return renderAlternativesInput();
      default:
        return null;
    }
  };

  // Hiển thị lựa chọn chế độ
  const renderModeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Chọn loại bài toán AHP</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chi tiêu sinh viên */}
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-200 cursor-pointer transition-shadow"
          onClick={() => handleModeSelect('student-expense')}
        >
          <h3 className="text-xl font-bold mb-3 text-blue-600">Chi tiêu cho sinh viên</h3>
          <p className="text-gray-600 mb-4">
            Sử dụng các tiêu chí mặc định đã được thiết lập sẵn cho bài toán chi tiêu sinh viên.
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>Học tập</li>
            <li>Nơi ở</li>
            <li>Chữa bệnh</li>
            <li>Ăn uống</li>
            <li>Giải trí</li>
            <li>Di chuyển</li>
            <li>Phát sinh</li>
          </ul>
        </div>
        
        {/* Tạo mới */}
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-200 cursor-pointer transition-shadow"
          onClick={() => handleModeSelect('custom')}
        >
          <h3 className="text-xl font-bold mb-3 text-blue-600">Tạo mới</h3>
          <p className="text-gray-600 mb-4">
            Tạo bài toán AHP với các tiêu chí tùy chỉnh theo nhu cầu cụ thể của bạn.
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>Thêm tiêu chí tùy ý</li>
            <li>Đặt tên và mô tả tùy chỉnh</li>
            <li>Dễ dàng thêm/xóa tiêu chí</li>
            <li>Phù hợp mọi bài toán quyết định</li>
          </ul>
        </div>
        
        {/* Tạo với AI */}
        <div 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg border border-gray-200 cursor-pointer transition-shadow opacity-75"
          onClick={() => handleModeSelect('ai-assisted')}
        >
          <h3 className="text-xl font-bold mb-3 text-blue-600">Tạo với AI <span className="text-xs font-normal bg-yellow-100 px-2 py-1 rounded text-yellow-700">Sắp ra mắt</span></h3>
          <p className="text-gray-600 mb-4">
            Để AI gợi ý các tiêu chí dựa trên mô tả bài toán của bạn.
          </p>
          <ul className="text-sm text-gray-500 list-disc list-inside">
            <li>Gợi ý tiêu chí thông minh</li>
            <li>Tiết kiệm thời gian</li>
            <li>Phân tích dựa trên dữ liệu</li>
            <li>Hỗ trợ các bài toán phức tạp</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Hiển thị form nhập thông tin bài toán
  const renderProblemInfo = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Thông tin bài toán AHP</h2>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="mb-4">
          <label htmlFor="problemTitle" className="block mb-2 font-medium text-gray-700">Tiêu đề bài toán</label>
          <input
            id="problemTitle"
            type="text"
            value={problemTitle}
            onChange={(e) => setProblemTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ví dụ: Chi tiêu học kỳ tới"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="problemDescription" className="block mb-2 font-medium text-gray-700">Mô tả bài toán</label>
          <textarea
            id="problemDescription"
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
            placeholder="Mô tả mục tiêu và bối cảnh của bài toán..."
          />
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-4 text-gray-800">Các tiêu chí đánh giá</h3>
      
      {criteria.map((criterion, index) => (
        <div key={criterion.id} className="mb-6 p-4 bg-white rounded-lg shadow border border-gray-200 relative">
          <div className="mb-4 grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={`criterion-name-${index}`} className="block mb-2 font-medium text-gray-700">
                Tên tiêu chí {index + 1}
              </label>
              <input
                id={`criterion-name-${index}`}
                type="text"
                value={criterion.name}
                onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ví dụ: Học tập, Ăn uống..."
              />
            </div>
            
            <div>
              <label htmlFor={`criterion-desc-${index}`} className="block mb-2 font-medium text-gray-700">
                Mô tả tiêu chí
              </label>
              <input
                id={`criterion-desc-${index}`}
                type="text"
                value={criterion.description}
                onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả ngắn gọn về tiêu chí này..."
              />
            </div>
          </div>
          
          {criteria.length > 1 && (
            <button
              type="button"
              onClick={() => removeCriterion(criterion.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 flex items-center"
            >
              <FaTrash className="mr-1" /> Xóa tiêu chí này
            </button>
          )}
        </div>
      ))}
      
      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={addCriterion}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <FaPlus className="mr-2" /> Thêm tiêu chí mới
        </button>
      </div>
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Quay lại
        </button>
        
        <button
          type="button"
          onClick={handleInfoContinue}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  // Hiển thị so sánh các tiêu chí (sẽ được triển khai ở bước tiếp theo)
  const renderCriteriaInput = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">So sánh cặp các tiêu chí</h2>
      <p className="text-center text-gray-600 mb-6">
        So sánh mức độ quan trọng giữa các tiêu chí để xác định trọng số
      </p>
      
      <div className="p-6 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-3 mt-1" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">Hướng dẫn so sánh cặp tiêu chí:</h3>
            <p className="text-blue-700">
              Bước tiếp theo sẽ cho phép bạn so sánh mức độ quan trọng tương đối giữa các tiêu chí với nhau.
              Tùy thuộc vào mục tiêu của bạn, hãy đánh giá các tiêu chí theo từng cặp để xác định trọng số
              của mỗi tiêu chí khi đánh giá các phương án chi tiêu.
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-700 font-bold mb-6">
        Bạn đã nhập {criteria.length} tiêu chí. Nhấn tiếp tục để thực hiện so sánh cặp.
      </p>
      
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={() => setStep(mode === 'student-expense' ? 0 : 1)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Quay lại
        </button>
        
        <button
          type="button"
          onClick={() => router.push('/comparison')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Tiếp tục đến so sánh cặp
        </button>
      </div>
    </div>
  );

  // Hiển thị nhập phương án (sẽ được triển khai ở bước tiếp theo)
  const renderAlternativesInput = () => (
    <div>
      <h2>Nhập các phương án</h2>
      {/* Sẽ triển khai sau */}
    </div>
  );

  return (
    <div className="py-6">
      {/* Hiển thị tiến độ */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="w-full flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 0 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              3
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              4
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
          <div className="text-center flex-1">Chọn loại<br />bài toán</div>
          <div className="text-center flex-1">Nhập<br />tiêu chí</div>
          <div className="text-center flex-1">So sánh<br />tiêu chí</div>
          <div className="text-center flex-1">Nhập<br />phương án</div>
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
}
