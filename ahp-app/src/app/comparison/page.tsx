'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AHPProblem, Criterion } from '@/types/ahp';
import ComparisonMatrix from '@/components/ComparisonMatrix';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaCalculator, FaInfoCircle } from 'react-icons/fa';

export default function ComparisonPage() {
  const router = useRouter();
  const [problem, setProblem] = useState<AHPProblem | null>(null);
  const [criteriaMatrix, setCriteriaMatrix] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaWeights, setCriteriaWeights] = useState<number[] | null>(null);
  const [consistencyRatio, setConsistencyRatio] = useState<{
    lambda_max: number;
    ci: number;
    ri: number;
    cr: number;
    is_consistent: boolean;
  } | null>(null);
  const [normalizedMatrix, setNormalizedMatrix] = useState<number[][] | null>(null);

  // Tải dữ liệu bài toán từ localStorage khi trang được tải
  useEffect(() => {
    const problemData = localStorage.getItem('ahpProblemData');
    if (problemData) {
      try {
        const parsedData = JSON.parse(problemData) as AHPProblem;
        setProblem(parsedData);
      } catch (err) {
        setError('Có lỗi khi tải dữ liệu bài toán.');
      }
    } else {
      setError('Không tìm thấy dữ liệu bài toán.');
    }
  }, []);

  // Xử lý thay đổi ma trận so sánh tiêu chí
  const handleCriteriaMatrixChange = (matrix: Record<string, number>) => {
    setCriteriaMatrix(matrix);
    localStorage.setItem('ahpCriteriaMatrix', JSON.stringify(matrix));
  };

  // Chuyển đổi ma trận so sánh từ dạng record sang ma trận 2D
  const convertToMatrix = (items: Criterion[], matrixData: Record<string, number>): number[][] => {
    const n = items.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    // Đảm bảo các item có ID hợp lệ
    const safeItems = items.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
    }));
    
    // Điền ma trận với các giá trị từ matrixData hoặc dùng giá trị mặc định 1
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const key = `${safeItems[i].id}-${safeItems[j].id}`;
        
        // Đảm bảo giá trị là số hợp lệ (không phải NaN, Infinity, null, undefined)
        let value = matrixData[key];
        if (isNaN(value) || value === null || value === undefined || !isFinite(value)) {
          if (i === j) value = 1;
          else {
            // Thử tìm giá trị đối xứng
            const reverseKey = `${safeItems[j].id}-${safeItems[i].id}`;
            const reverseValue = matrixData[reverseKey];
            if (!isNaN(reverseValue) && reverseValue !== null && isFinite(reverseValue) && reverseValue !== 0) {
              value = 1 / reverseValue;
            } else {
              value = 1; // Giá trị mặc định nếu không tìm thấy
            }
          }
        }
        matrix[i][j] = value;
      }
    }
    
    // Kiểm tra ma trận để đảm bảo tính đối xứng và đường chéo bằng 1
    for (let i = 0; i < n; i++) {
      // Đảm bảo đường chéo bằng 1
      matrix[i][i] = 1;
      
      for (let j = 0; j < i; j++) {
        // Đảm bảo tính đối xứng: a[j][i] = 1/a[i][j]
        if (matrix[i][j] !== 0) {
          matrix[j][i] = 1 / matrix[i][j];
        } else {
          matrix[i][j] = 1;
          matrix[j][i] = 1;
        }
      }
    }
    
    console.log('Ma trận chuyển đổi:', matrix);
    return matrix;
  };

  // Tính toán ma trận chuẩn hóa (hiển thị cho người dùng)
  const calculateNormalizedMatrix = (matrix: number[][]): number[][] => {
    const n = matrix.length;
    const normalized = Array(n).fill(0).map(() => Array(n).fill(0));
    
    // Tính tổng theo cột
    const colSums = matrix.reduce((sums, row, i) => {
      row.forEach((val, j) => {
        sums[j] = (sums[j] || 0) + val;
      });
      return sums;
    }, Array(n).fill(0));
    
    // Chuẩn hóa ma trận
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        normalized[i][j] = matrix[i][j] / colSums[j];
      }
    }
    
    return normalized;
  };

  // Tính trọng số của các tiêu chí từ ma trận chuẩn hóa (hiển thị cho người dùng)
  const calculateWeights = (normalizedMatrix: number[][]): number[] => {
    const n = normalizedMatrix.length;
    const weights = Array(n).fill(0);
    
    // Tính trung bình theo hàng
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum += normalizedMatrix[i][j];
      }
      weights[i] = sum / n;
    }
    
    return weights;
  };

  // Tính toán các chỉ số AHP bằng cách gọi API Python
  const calculateAHP = async () => {
    if (!problem || !problem.criteria || problem.criteria.length < 2) {
      setError('Cần ít nhất 2 tiêu chí để tính toán.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Chuyển đổi ma trận so sánh từ dạng record sang ma trận 2D
      const matrix = convertToMatrix(problem.criteria, criteriaMatrix);
      
      // Hiển thị ma trận chuẩn hóa và trọng số trước khi gửi đến API
      const normalizedMat = calculateNormalizedMatrix(matrix);
      setNormalizedMatrix(normalizedMat);
      
      // Tạo dữ liệu để gửi đến API Python
      const apiData = {
        criteria_matrix: matrix,
        alternatives_matrices: [],
        criteria_names: problem.criteria.map(c => c.name),
        alternative_names: []
      };

      // Gọi API Python để tính toán AHP
      const response = await axios.post('http://localhost:5001/calculate', apiData);
      
      // Lưu kết quả
      setCriteriaWeights(response.data.criteria_weights);
      setConsistencyRatio(response.data.criteria_consistency);
      
      // Lưu thông tin trọng số và tỷ số nhất quán vào localStorage
      localStorage.setItem('ahpCriteriaWeights', JSON.stringify(response.data.criteria_weights));
      localStorage.setItem('ahpCriteriaConsistency', JSON.stringify(response.data.criteria_consistency));
      
    } catch (err) {
      console.error('Lỗi khi tính toán AHP:', err);
      setError('Có lỗi khi tính toán AHP. Vui lòng kiểm tra lại dữ liệu nhập vào.');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi tiếp tục sang bước nhập phương án
  const handleContinueToAlternatives = () => {
    // Kiểm tra xem đã tính toán trọng số chưa
    if (!criteriaWeights) {
      setError('Vui lòng tính toán trọng số các tiêu chí trước khi tiếp tục.');
      return;
    }
    
    // Kiểm tra tỷ số nhất quán
    if (consistencyRatio && !consistencyRatio.is_consistent) {
      const confirmed = window.confirm(
        `Tỷ số nhất quán (CR) = ${(consistencyRatio.cr * 100).toFixed(2)}% > 10%. ` +
        'Đánh giá của bạn có thể không nhất quán. Bạn có muốn điều chỉnh lại không?'
      );
      if (confirmed) {
        return; // Quay lại điều chỉnh ma trận
      }
    }
    
    // Chuyển đến trang nhập phương án
    router.push('/alternatives');
  };

  // Hiển thị giá trị ma trận chuẩn hóa với 4 chữ số thập phân
  const displayNormalizedValue = (value: number): string => {
    return value.toFixed(4);
  };

  // Hiển thị trọng số với 4 chữ số thập phân
  const displayWeight = (value: number): string => {
    return value.toFixed(4);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">Lỗi</h2>
        <p className="text-red-600">{error}</p>
        <Link href="/create-problem" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
          Quay lại tạo bài toán
        </Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">{problem.title}</h1>
      <p className="text-gray-600 mb-6">{problem.description}</p>
      
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FaInfoCircle className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-blue-800 mb-1">So sánh cặp các tiêu chí</h3>
            <p className="text-blue-700">
              Hãy so sánh mức độ quan trọng tương đối giữa các tiêu chí ở hàng ngang so với các tiêu chí ở cột dọc.
              Sử dụng thang điểm Saaty từ 1/9 đến 9, trong đó 1 nghĩa là hai tiêu chí có tầm quan trọng như nhau, 
              9 nghĩa là tiêu chí ở hàng quan trọng tuyệt đối hơn tiêu chí ở cột.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Ma trận so sánh cặp các tiêu chí</h2>
        
        <ComparisonMatrix 
          items={problem.criteria} 
          onChange={handleCriteriaMatrixChange}
        />
        
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={calculateAHP}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300"
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                Đang tính toán...
              </>
            ) : (
              <>
                <FaCalculator className="mr-2" /> Tính toán trọng số và tỷ số nhất quán
              </>
            )}
          </button>
        </div>
      </div>
      
      {normalizedMatrix && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Ma trận chuẩn hóa</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 border border-gray-200"></th>
                  {problem.criteria.map((criterion, index) => (
                    <th key={criterion.id} className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">
                      {criterion.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problem.criteria.map((criterion, rowIndex) => (
                  <tr key={criterion.id}>
                    <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-800 bg-blue-50">
                      {criterion.name}
                    </th>
                    {normalizedMatrix[rowIndex].map((value, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 border border-gray-200 text-center font-mono text-gray-800">
                        {displayNormalizedValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {criteriaWeights && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Trọng số các tiêu chí</h2>
          
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
                      {displayWeight(criteriaWeights[index])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {consistencyRatio && (
        <div className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tỷ số nhất quán (Consistency Ratio)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">λ max</div>
              <div className="text-lg font-semibold">{consistencyRatio.lambda_max.toFixed(4)}</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">CI</div>
              <div className="text-lg font-semibold">{consistencyRatio.ci.toFixed(4)}</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">RI</div>
              <div className="text-lg font-semibold">{consistencyRatio.ri.toFixed(2)}</div>
            </div>
            
            <div className={`p-3 rounded border ${
              consistencyRatio.is_consistent ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div className="text-sm text-gray-500">CR</div>
              <div className={`text-lg font-semibold ${
                consistencyRatio.is_consistent ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {(consistencyRatio.cr * 100).toFixed(2)}%
                {consistencyRatio.is_consistent 
                  ? ' ✓ (Nhất quán)' 
                  : ' ⚠️ (Không nhất quán)'
                }
              </div>
            </div>
          </div>
          
          {!consistencyRatio.is_consistent && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700">
                <strong>Lưu ý:</strong> Tỷ số nhất quán (CR) lớn hơn 10%. Điều này có nghĩa là các đánh 
                giá của bạn có thể không nhất quán. Bạn có thể điều chỉnh lại ma trận so sánh cặp để cải 
                thiện tính nhất quán.
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Giải thích:</strong> Tỷ số nhất quán (CR) là chỉ số đánh giá mức độ nhất quán trong 
              các đánh giá so sánh cặp. Theo T. Saaty, CR &lt; 10% được coi là chấp nhận được. Nếu CR lớn 
              hơn 10%, bạn nên xem xét lại các đánh giá so sánh cặp.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <Link 
          href="/create-problem"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Quay lại
        </Link>
        
        {criteriaWeights && (
          <button
            type="button"
            onClick={handleContinueToAlternatives}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tiếp tục nhập phương án <FaArrowRight className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}

    </div>
  );
}

                  </div>
                </section>
                
                <section>
                  <h4 className="font-semibold text-lg mb-2">4. Tính điểm tổng hợp cho các phương án</h4>
                  <p>Mỗi phương án được đánh giá trên từng tiêu chí, từ đó tính điểm tổng hợp:</p>
                  <div className="p-3 bg-gray-50 rounded my-2 font-mono">
                    final_score[alternative_i] = sum(criteria_weights[j] * alternative_weight[j][i])
                  </div>
                  <p>Phương án có điểm tổng hợp cao nhất là phương án tốt nhất.</p>
                </section>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {normalizedMatrix && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Ma trận chuẩn hóa</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 border border-gray-200"></th>
                  {problem.criteria.map((criterion, index) => (
                    <th key={criterion.id} className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">
                      {criterion.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problem.criteria.map((criterion, rowIndex) => (
                  <tr key={criterion.id}>
                    <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-800 bg-blue-50">
                      {criterion.name}
                    </th>
                    {normalizedMatrix[rowIndex].map((value, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 border border-gray-200 text-center font-mono text-gray-800">
                        {displayNormalizedValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {criteriaWeights && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Trọng số các tiêu chí</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">Tiêu chí</th>
                  <th className="px-4 py-2 border border-gray-200 font-semibold text-gray-800">Trọng số</th>
                </tr>
              </thead>
              <tbody>
                {problem.criteria.map((criterion, index) => (
                  <tr key={criterion.id}>
                    <td className="px-4 py-2 border border-gray-200 font-semibold text-gray-800 bg-blue-50">{criterion.name}</td>
                    <td className="px-4 py-2 border border-gray-200 text-center font-mono text-gray-800">
                      {displayWeight(criteriaWeights[index])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {consistencyRatio && (
        <div className="mb-8 p-4 bg-white border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Tỷ số nhất quán (Consistency Ratio)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">λ max</div>
              <div className="text-lg font-semibold">{consistencyRatio.lambda_max.toFixed(4)}</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">CI</div>
              <div className="text-lg font-semibold">{consistencyRatio.ci.toFixed(4)}</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded border">
              <div className="text-sm text-gray-500">RI</div>
              <div className="text-lg font-semibold">{consistencyRatio.ri.toFixed(2)}</div>
            </div>
            
            <div className={`p-3 rounded border ${
              consistencyRatio.is_consistent ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <div className="text-sm text-gray-500">CR</div>
              <div className={`text-lg font-semibold ${
                consistencyRatio.is_consistent ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {(consistencyRatio.cr * 100).toFixed(2)}%
                {consistencyRatio.is_consistent 
                  ? ' ✓ (Nhất quán)' 
                  : ' ⚠️ (Không nhất quán)'
                }
              </div>
            </div>
          </div>
          
          {!consistencyRatio.is_consistent && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-700">
                <strong>Lưu ý:</strong> Tỷ số nhất quán (CR) lớn hơn 10%. Điều này có nghĩa là các đánh 
                giá của bạn có thể không nhất quán. Bạn có thể điều chỉnh lại ma trận so sánh cặp để cải 
                thiện tính nhất quán.
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-gray-700">
              <strong>Giải thích:</strong> Tỷ số nhất quán (CR) là chỉ số đánh giá mức độ nhất quán trong 
              các đánh giá so sánh cặp. Theo T. Saaty, CR &lt; 10% được coi là chấp nhận được. Nếu CR lớn 
              hơn 10%, bạn nên xem xét lại các đánh giá so sánh cặp.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-8">
        <Link 
          href="/create-problem"
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Quay lại
        </Link>
        
        {criteriaWeights && (
          <button
            type="button"
            onClick={handleContinueToAlternatives}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tiếp tục nhập phương án <FaArrowRight className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
