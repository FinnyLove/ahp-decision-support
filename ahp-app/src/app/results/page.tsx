'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AHPProblem, AHPResult } from '@/types/ahp';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Radar } from 'react-chartjs-2';
import { FaDownload, FaHome, FaRedo, FaSave } from 'react-icons/fa';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default function ResultsPage() {
  const [problem, setProblem] = useState<AHPProblem | null>(null);
  const [results, setResults] = useState<AHPResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>('blues');

  // Định nghĩa các bảng màu
  const colorSchemes = {
    blues: ['#9dc6e0', '#5ba4d4', '#3182bd', '#105fa8', '#08306b'],
    greens: ['#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c'],
    oranges: ['#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
    purples: ['#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486'],
    reds: ['#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d']
  };

  const getColors = (count: number) => {
    const scheme = colorSchemes[selectedColorScheme as keyof typeof colorSchemes] || colorSchemes.blues;
    // Nếu có ít hơn 5 phương án, sử dụng các màu đầu tiên
    if (count <= scheme.length) {
      return scheme.slice(0, count);
    }
    // Nếu có nhiều hơn 5 phương án, tạo màu trung gian
    const colors = [...scheme];
    for (let i = colors.length; i < count; i++) {
      const idx = i % scheme.length;
      colors.push(scheme[idx]);
    }
    return colors;
  };

  useEffect(() => {
    // Tải dữ liệu bài toán và kết quả từ localStorage
    const problemData = localStorage.getItem('ahpProblemData');
    const resultsData = localStorage.getItem('ahpResults');
    
    if (problemData && resultsData) {
      try {
        const parsedProblem = JSON.parse(problemData) as AHPProblem;
        const parsedResults = JSON.parse(resultsData) as AHPResult;
        
        setProblem(parsedProblem);
        setResults(parsedResults);
      } catch (err) {
        setError('Có lỗi khi tải dữ liệu bài toán và kết quả.');
      }
    } else {
      setError('Không tìm thấy dữ liệu bài toán hoặc kết quả. Vui lòng thực hiện các bước trước.');
    }
    
    setLoading(false);
  }, []);

  // Xuất kết quả dưới dạng PDF (placeholder function)
  const exportResults = () => {
    alert('Tính năng xuất kết quả đang được phát triển.');
  };

  // Lưu kết quả (placeholder function)
  const saveResults = () => {
    alert('Kết quả đã được lưu trong localStorage.');
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
          <Link href="/" className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !problem || !results) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Lấy tên các phương án
  const alternativeNames = problem.alternatives.map(alt => alt.name);
  
  // Lấy tên các tiêu chí
  const criteriaNames = problem.criteria.map(crit => crit.name);
  
  // Tổng hợp điểm của các phương án
  const finalScores = results.final_scores;
  
  // Trọng số các tiêu chí
  const criteriaWeights = results.criteria_weights;
  
  // Chuẩn bị dữ liệu cho biểu đồ cột
  const barChartData = {
    labels: alternativeNames,
    datasets: [
      {
        label: 'Điểm tổng hợp',
        data: finalScores,
        backgroundColor: getColors(alternativeNames.length),
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Chuẩn bị dữ liệu cho biểu đồ tròn
  const pieChartData = {
    labels: criteriaNames,
    datasets: [
      {
        label: 'Trọng số tiêu chí',
        data: criteriaWeights,
        backgroundColor: getColors(criteriaNames.length),
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 2,
      },
    ],
  };
  
  // Chuẩn bị dữ liệu cho biểu đồ radar
  const radarChartData = {
    labels: criteriaNames,
    datasets: alternativeNames.map((name, altIndex) => ({
      label: name,
      data: criteriaNames.map((_, critIndex) => {
        // Trọng số của phương án này theo tiêu chí hiện tại
        return results.alternatives_weights[critIndex][altIndex];
      }),
      backgroundColor: `${getColors(alternativeNames.length)[altIndex]}33`, // Thêm độ trong suốt
      borderColor: getColors(alternativeNames.length)[altIndex],
      borderWidth: 2,
      pointBackgroundColor: getColors(alternativeNames.length)[altIndex],
      pointRadius: 3,
    })),
  };

  // Các tùy chọn cho biểu đồ cột
  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Điểm tổng hợp của các phương án',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1,
      },
    },
  };
  
  // Các tùy chọn cho biểu đồ tròn
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Trọng số các tiêu chí',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };
  
  // Các tùy chọn cho biểu đồ radar
  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Trọng số của các phương án theo tiêu chí',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        suggestedMax: 1,
      },
    },
  };
  
  // Tìm phương án có điểm số cao nhất
  const bestAlternativeIndex = finalScores.indexOf(Math.max(...finalScores));
  const bestAlternative = problem.alternatives[bestAlternativeIndex];
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kết quả phân tích AHP</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={saveResults}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaSave className="mr-2" /> Lưu
          </button>
          <button 
            onClick={exportResults}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaDownload className="mr-2" /> Xuất PDF
          </button>
          <Link 
            href="/create-problem"
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <FaRedo className="mr-2" /> Tạo bài toán mới
          </Link>
        </div>
      </div>
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{problem.title}</h2>
        <p className="text-gray-600 mb-6">{problem.description}</p>
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-2">Kết luận</h3>
          <p className="text-blue-700">
            Dựa trên phân tích AHP, phương án tốt nhất là:{' '}
            <span className="font-bold text-blue-900">{bestAlternative.name}</span> với điểm số{' '}
            <span className="font-bold text-blue-900">{finalScores[bestAlternativeIndex].toFixed(4)}</span>
          </p>
          {bestAlternative.description && (
            <p className="mt-2 text-blue-700">
              <span className="font-semibold">Mô tả phương án:</span> {bestAlternative.description}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bảng màu biểu đồ:
          </label>
          <select
            value={selectedColorScheme}
            onChange={(e) => setSelectedColorScheme(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="blues">Xanh dương</option>
            <option value="greens">Xanh lá</option>
            <option value="oranges">Cam</option>
            <option value="purples">Tím</option>
            <option value="reds">Đỏ</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Điểm tổng hợp các phương án</h3>
          <div className="h-80">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Trọng số các tiêu chí</h3>
          <div className="h-80">
            <Pie data={pieChartData} options={pieOptions} />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Phân tích phương án theo tiêu chí</h3>
        <div className="h-96">
          <Radar data={radarChartData} options={radarOptions} />
        </div>
      </div>

      {/* Biểu đồ phân tích độ nhạy (Sensitivity Analysis) */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Phân tích độ nhạy</h3>
        <p className="text-gray-600 mb-4">Đánh giá mức độ ảnh hưởng của từng tiêu chí lên kết quả cuối cùng.</p>
        
        <div className="space-y-8">
          {/* Tạo biểu đồ cho mỗi tiêu chí */}
          {criteriaNames.map((criterionName, criterionIndex) => {
            // Lấy trọng số của các phương án theo tiêu chí này
            const alternativeWeightsForCriterion = results.alternatives_weights[criterionIndex];
            
            // Tạo dữ liệu cho biểu đồ cột
            const sensitivityChartData = {
              labels: alternativeNames,
              datasets: [
                {
                  label: `Trọng số theo tiêu chí ${criterionName}`,
                  data: alternativeWeightsForCriterion,
                  backgroundColor: getColors(alternativeNames.length),
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
                },
              ],
            };
            
            // Tùy chọn biểu đồ cột ngang
            const sensitivityOptions = {
              indexAxis: 'y' as const,
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: `Đánh giá theo tiêu chí: ${criterionName} (trọng số ${criteriaWeights[criterionIndex].toFixed(4)})`,
                  font: {
                    size: 14,
                    weight: 'bold' as const,
                  },
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  max: 1,
                  title: {
                    display: true,
                    text: 'Trọng số',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Phương án',
                  },
                },
              },
            };
            
            return (
              <div key={criterionIndex} className="border rounded-lg p-4">
                <div className="h-64">
                  <Bar data={sensitivityChartData} options={sensitivityOptions} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Bảng điểm các phương án</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border border-gray-200">Phương án</th>
                  <th className="px-4 py-2 border border-gray-200">Điểm số</th>
                  <th className="px-4 py-2 border border-gray-200">Xếp hạng</th>
                </tr>
              </thead>
              <tbody>
                {finalScores
                  .map((score, index) => ({ 
                    score, 
                    name: alternativeNames[index], 
                    index 
                  }))
                  .sort((a, b) => b.score - a.score)
                  .map((item, rank) => (
                    <tr 
                      key={item.index} 
                      className={item.index === bestAlternativeIndex ? 'bg-green-50' : ''}
                    >
                      <td className="px-4 py-2 border border-gray-200">
                        {item.name}
                        {item.index === bestAlternativeIndex && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Tốt nhất
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-center">
                        {item.score.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 border border-gray-200 text-center">
                        {rank + 1}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Tỷ số nhất quán (CR)</h3>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold mb-2">Tiêu chí</h4>
              <p className={`text-lg font-bold ${results.criteria_consistency.is_consistent ? 'text-green-600' : 'text-red-600'}`}>
                CR = {(results.criteria_consistency.cr * 100).toFixed(2)}%
                {results.criteria_consistency.is_consistent 
                  ? ' ✓ (Nhất quán)' 
                  : ' ⚠️ (Không nhất quán)'
                }
              </p>
            </div>
            
            {criteriaNames.map((name, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">Phương án theo tiêu chí: {name}</h4>
                <p className={`text-lg font-bold ${results.alternatives_consistency[index].is_consistent ? 'text-green-600' : 'text-red-600'}`}>
                  CR = {(results.alternatives_consistency[index].cr * 100).toFixed(2)}%
                  {results.alternatives_consistency[index].is_consistent 
                    ? ' ✓ (Nhất quán)' 
                    : ' ⚠️ (Không nhất quán)'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Bảng ma trận trọng số đầy đủ</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 border border-gray-200">Phương án / Tiêu chí</th>
                {criteriaNames.map((name, index) => (
                  <th key={index} className="px-4 py-2 border border-gray-200">
                    {name} ({criteriaWeights[index].toFixed(4)})
                  </th>
                ))}
                <th className="px-4 py-2 border border-gray-200 bg-blue-50">Điểm tổng hợp</th>
              </tr>
            </thead>
            <tbody>
              {alternativeNames.map((name, altIndex) => (
                <tr key={altIndex}>
                  <td className="px-4 py-2 border border-gray-200 font-medium">
                    {name}
                  </td>
                  {criteriaNames.map((_, critIndex) => (
                    <td key={critIndex} className="px-4 py-2 border border-gray-200 text-center">
                      {results.alternatives_weights[critIndex][altIndex].toFixed(4)}
                    </td>
                  ))}
                  <td className="px-4 py-2 border border-gray-200 text-center font-bold bg-blue-50">
                    {finalScores[altIndex].toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Link 
          href="/alternatives-comparison"
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        >
          Quay lại so sánh phương án
        </Link>
        
        <Link 
          href="/"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaHome className="mr-2" /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
