'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { AHPProblem, Criterion, Alternative } from '@/types/ahp';
import ComparisonMatrix from '@/components/ComparisonMatrix';
import { FaArrowLeft, FaArrowRight, FaCalculator, FaChartBar, FaInfoCircle } from 'react-icons/fa';

export default function AlternativesComparisonPage() {
  const router = useRouter();
  const [problem, setProblem] = useState<AHPProblem | null>(null);
  const [criteriaWeights, setCriteriaWeights] = useState<number[] | null>(null);
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);
  const [alternativesMatrices, setAlternativesMatrices] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allMatricesCompleted, setAllMatricesCompleted] = useState(false);

  useEffect(() => {
    // Tải dữ liệu bài toán từ localStorage
    const problemData = localStorage.getItem('ahpProblemData');
    const weightsData = localStorage.getItem('ahpCriteriaWeights');
    const matricesData = localStorage.getItem('ahpAlternativesMatrices');
    
    if (problemData && weightsData) {
      try {
        const parsedProblem = JSON.parse(problemData) as AHPProblem;
        const parsedWeights = JSON.parse(weightsData) as number[];
        
        setProblem(parsedProblem);
        setCriteriaWeights(parsedWeights);
        
        // Kiểm tra xem có ma trận phương án đã lưu hay không
        if (matricesData) {
          const parsedMatrices = JSON.parse(matricesData) as Record<string, Record<string, number>>;
          setAlternativesMatrices(parsedMatrices);
          
          // Kiểm tra xem tất cả các ma trận đã hoàn thành chưa
          const allCompleted = parsedProblem.criteria.every(criterion => 
            parsedMatrices[criterion.id] && 
            Object.keys(parsedMatrices[criterion.id]).length > 0
          );
          
          setAllMatricesCompleted(allCompleted);
          
          // Nếu tất cả ma trận đã hoàn thành, chuyển đến tiêu chí cuối cùng
          if (allCompleted) {
            setCurrentCriterionIndex(parsedProblem.criteria.length - 1);
          }
        }
      } catch (err) {
        setError('Có lỗi khi tải dữ liệu bài toán.');
      }
    } else {
      setError('Không tìm thấy dữ liệu bài toán hoặc trọng số tiêu chí. Vui lòng thực hiện các bước trước.');
    }
  }, []);

  // Xử lý thay đổi ma trận so sánh phương án
  const handleMatrixChange = (matrix: Record<string, number>) => {
    if (!problem) return;
    
    const currentCriterion = problem.criteria[currentCriterionIndex];
    
    // Cập nhật ma trận cho tiêu chí hiện tại
    const updatedMatrices = {
      ...alternativesMatrices,
      [currentCriterion.id]: matrix
    };
    
    setAlternativesMatrices(updatedMatrices);
    localStorage.setItem('ahpAlternativesMatrices', JSON.stringify(updatedMatrices));
    
    // Kiểm tra xem tất cả các ma trận đã hoàn thành chưa
    const allCompleted = problem.criteria.every(criterion => 
      updatedMatrices[criterion.id] && 
      Object.keys(updatedMatrices[criterion.id]).length > 0
    );
    
    setAllMatricesCompleted(allCompleted);
  };

  // Chuyển đến tiêu chí trước
  const goToPreviousCriterion = () => {
    if (currentCriterionIndex > 0) {
      setCurrentCriterionIndex(currentCriterionIndex - 1);
    }
  };

  // Chuyển đến tiêu chí tiếp theo
  const goToNextCriterion = () => {
    if (!problem) return;
    
    const currentCriterion = problem.criteria[currentCriterionIndex];
    
    // Kiểm tra xem ma trận hiện tại đã được nhập chưa
    if (!alternativesMatrices[currentCriterion.id] || Object.keys(alternativesMatrices[currentCriterion.id]).length === 0) {
      alert('Vui lòng so sánh các phương án theo tiêu chí hiện tại trước khi chuyển sang tiêu chí tiếp theo.');
      return;
    }
    
    if (currentCriterionIndex < problem.criteria.length - 1) {
      setCurrentCriterionIndex(currentCriterionIndex + 1);
    }
  };

  // Chuyển đổi ma trận từ dạng record sang ma trận 2D
  const convertToMatrix = (items: Alternative[], matrixData: Record<string, number>): number[][] => {
    const n = items.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const key = `${items[i].id}-${items[j].id}`;
        matrix[i][j] = matrixData[key] || 1;
      }
    }
    
    return matrix;
  };

  // Tính toán kết quả AHP
  const calculateResults = async () => {
    if (!problem || !criteriaWeights) {
      setError('Không tìm thấy dữ liệu bài toán hoặc trọng số tiêu chí.');
      return;
    }
    
    // Kiểm tra xem tất cả các ma trận so sánh đã được nhập chưa
    const missingMatrices = problem.criteria.filter(criterion => 
      !alternativesMatrices[criterion.id] || 
      Object.keys(alternativesMatrices[criterion.id]).length === 0
    );
    
    if (missingMatrices.length > 0) {
      alert(`Vui lòng hoàn thành so sánh phương án cho các tiêu chí sau: ${missingMatrices.map(c => c.name).join(', ')}`);
      return;
    }
    
    setCalculating(true);
    setError(null);
    
    try {
      // Chuyển đổi ma trận tiêu chí
      const criteriaMatrix = localStorage.getItem('ahpCriteriaMatrix');
      const parsedCriteriaMatrix = criteriaMatrix ? JSON.parse(criteriaMatrix) : {};
      const criteriaMatrixArray = convertToMatrix(problem.criteria, parsedCriteriaMatrix);
      
      // Chuyển đổi ma trận phương án theo từng tiêu chí
      const alternativesMatricesArray = problem.criteria.map(criterion => {
        const matrixData = alternativesMatrices[criterion.id] || {};
        return convertToMatrix(problem.alternatives, matrixData);
      });
      
      // Tạo dữ liệu để gửi đến API Python
      const apiData = {
        criteria_matrix: criteriaMatrixArray,
        alternatives_matrices: alternativesMatricesArray,
        criteria_names: problem.criteria.map(c => c.name),
        alternative_names: problem.alternatives.map(a => a.name)
      };
      
      // Gọi API Python để tính toán AHP
      const response = await axios.post('http://localhost:5001/calculate', apiData);
      
      // Lưu kết quả vào localStorage
      localStorage.setItem('ahpResults', JSON.stringify(response.data));
      
      // Chuyển đến trang kết quả
      router.push('/results');
      
    } catch (err) {
      console.error('Lỗi khi tính toán AHP:', err);
      setError('Có lỗi khi tính toán kết quả AHP. Vui lòng kiểm tra lại dữ liệu nhập vào.');
    } finally {
      setCalculating(false);
    }
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
          <Link href="/alternatives" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md">
            Quay lại nhập phương án
          </Link>
        </div>
      </div>
    );
  }

  if (!problem || !criteriaWeights || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentCriterion = problem.criteria[currentCriterionIndex];
  const progress = ((currentCriterionIndex + 1) / problem.criteria.length) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">{problem.title}</h1>
      <p className="text-gray-600 mb-6">{problem.description}</p>
      
      {/* Thanh tiến độ */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiêu chí {currentCriterionIndex + 1} / {problem.criteria.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">So sánh cặp các phương án theo tiêu chí: {currentCriterion.name}</h3>
            <p className="text-blue-700 mb-2">
              {currentCriterion.description}
            </p>
            <p className="text-blue-700">
              Hãy so sánh mức độ ưu tiên tương đối của các phương án ở hàng ngang so với các phương án ở cột dọc
              theo tiêu chí <strong>{currentCriterion.name}</strong>.
            </p>
          </div>
        </div>
      </div>
      
      <ComparisonMatrix 
        items={problem.alternatives} 
        initialValues={alternativesMatrices[currentCriterion.id] || {}}
        onChange={handleMatrixChange}
        title={`So sánh cặp các phương án theo tiêu chí: ${currentCriterion.name}`}
      />
      
      <div className="flex justify-between mt-8">
        <div>
          <button
            type="button"
            onClick={goToPreviousCriterion}
            disabled={currentCriterionIndex === 0}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaArrowLeft className="inline mr-2" /> Tiêu chí trước
          </button>
          
          <button
            type="button"
            onClick={goToNextCriterion}
            disabled={currentCriterionIndex === problem.criteria.length - 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiêu chí tiếp theo <FaArrowRight className="inline ml-2" />
          </button>
        </div>
        
        {allMatricesCompleted && (
          <button
            type="button"
            onClick={calculateResults}
            disabled={calculating}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {calculating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                Đang tính toán...
              </>
            ) : (
              <>
                <FaChartBar className="mr-2" /> Xem kết quả phân tích
              </>
            )}
          </button>
        )}
      </div>
      
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-bold mb-3 text-gray-800">Tiến độ so sánh phương án</h3>
        
        <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-2 border border-gray-200">Tiêu chí</th>
              <th className="px-4 py-2 border border-gray-200">Trọng số</th>
              <th className="px-4 py-2 border border-gray-200">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {problem.criteria.map((criterion, index) => {
              const isCompleted = alternativesMatrices[criterion.id] && Object.keys(alternativesMatrices[criterion.id]).length > 0;
              const isCurrent = index === currentCriterionIndex;
              
              return (
                <tr 
                  key={criterion.id} 
                  className={isCurrent ? 'bg-blue-50' : ''}
                >
                  <td className="px-4 py-2 border border-gray-200">
                    {criterion.name}
                    {isCurrent && <span className="ml-2 text-blue-600 font-medium">(Đang so sánh)</span>}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    {criteriaWeights[index].toFixed(4)}
                  </td>
                  <td className="px-4 py-2 border border-gray-200 text-center">
                    {isCompleted ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Đã hoàn thành
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Chưa hoàn thành
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <p className="mt-4 text-gray-600 text-sm">
          <strong>Lưu ý:</strong> Bạn cần hoàn thành so sánh phương án theo tất cả các tiêu chí 
          trước khi có thể tính toán kết quả cuối cùng.
        </p>
      </div>
    </div>
  );
}
