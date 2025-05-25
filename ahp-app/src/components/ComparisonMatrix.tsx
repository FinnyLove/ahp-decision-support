'use client';

import { useState, useEffect } from 'react';
import { COMPARISON_SCALE, Criterion, Alternative } from '@/types/ahp';

type Item = Criterion | Alternative;

interface ComparisonMatrixProps {
  items: Item[];
  initialValues?: Record<string, number>;
  onChange: (matrix: Record<string, number>) => void;
  title?: string;
  readOnly?: boolean;
}

const ComparisonMatrix = ({ 
  items, 
  initialValues = {}, 
  onChange,
  title,
  readOnly = false
}: ComparisonMatrixProps) => {
  const [matrix, setMatrix] = useState<Record<string, number>>(initialValues);
  const [isInitialized, setIsInitialized] = useState(false);

  // Đảm bảo mỗi item đều có ID duy nhất
  const safeItems = items.map((item, index) => ({
    ...item,
    id: item.id || `item-${index}`, // Sử dụng ID được cung cấp hoặc tạo ID mới nếu không có
  }));

  // Khởi tạo ma trận ban đầu - chỉ chạy một lần khi component được tạo
  useEffect(() => {
    // Chỉ khởi tạo nếu không có giá trị ban đầu hoặc giá trị ban đầu rỗng
    if (Object.keys(initialValues).length === 0) {
      const newMatrix: Record<string, number> = {};
      
      // Đảm bảo tất cả các cặp đều có giá trị
      safeItems.forEach(item1 => {
        safeItems.forEach(item2 => {
          const key = `${item1.id}-${item2.id}`;
          
          // Đường chéo luôn là 1
          if (item1.id === item2.id) {
            newMatrix[key] = 1;
          } 
          // Các ô khác - khởi tạo với giá trị mặc định 1
          else if (!newMatrix[key] && !newMatrix[`${item2.id}-${item1.id}`]) {
            newMatrix[key] = 1; // Giá trị mặc định
            newMatrix[`${item2.id}-${item1.id}`] = 1; // Giá trị mặc định cho cặp đối xứng
          }
        });
      });
      
      console.log('Khởi tạo ma trận mới:', newMatrix);
      setMatrix(newMatrix);
      onChange(newMatrix);
    } else {
      // Đảm bảo ma trận có đủ các cặp so sánh
      const newMatrix = { ...initialValues };
      let updated = false;
      
      safeItems.forEach(item1 => {
        safeItems.forEach(item2 => {
          const key = `${item1.id}-${item2.id}`;
          
          // Đảm bảo đường chéo luôn là 1
          if (item1.id === item2.id && newMatrix[key] !== 1) {
            newMatrix[key] = 1;
            updated = true;
          }
          
          // Đảm bảo các cặp đều có giá trị và tính đúng giá trị đối xứng
          if (item1.id !== item2.id) {
            const reverseKey = `${item2.id}-${item1.id}`;
            if (newMatrix[key] && !newMatrix[reverseKey]) {
              newMatrix[reverseKey] = 1 / newMatrix[key];
              updated = true;
            }
          }
        });
      });
      
      if (updated) {
        console.log('Cập nhật đảm bảo ma trận đầy đủ:', newMatrix);
        setMatrix(newMatrix);
        onChange(newMatrix);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // Chỉ chạy 1 lần khi component được mount

  const handleComparisonChange = (itemId1: string, itemId2: string, value: number) => {
    if (itemId1 === itemId2) return; // Không thay đổi đường chéo
    if (readOnly) return; // Không cho phép sửa nếu đang ở chế độ chỉ đọc
    
    // Đảm bảo value là số hợp lệ và không phải là NaN
    const numericValue = isNaN(value) ? 1 : value;
    
    console.log(`Cập nhật ma trận: ${itemId1}-${itemId2} = ${numericValue}`);
    
    const key = `${itemId1}-${itemId2}`;
    const reverseKey = `${itemId2}-${itemId1}`;
    
    const newMatrix = { ...matrix };
    newMatrix[key] = numericValue;
    newMatrix[reverseKey] = 1 / numericValue;
    
    setMatrix(newMatrix);
    onChange(newMatrix);
  };

  const getComparisonValue = (itemId1: string, itemId2: string): number => {
    const key = `${itemId1}-${itemId2}`;
    const value = matrix[key] || 1;
    return value;
  };

  if (safeItems.length < 2) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">Cần ít nhất 2 mục để tạo ma trận so sánh.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      )}
      
      <table className="min-w-full border-collapse border border-gray-200 bg-white rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-blue-50">
            <th className="px-4 py-3 border border-gray-200 w-40"></th>
            {safeItems.map((item, colIndex) => (
              <th key={`header-${colIndex}-${item.id}`} className="px-4 py-3 border border-gray-200 font-medium text-gray-700">
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item1, rowIndex) => (
            <tr key={`row-${rowIndex}-${item1.id}`}>
              <th className="px-4 py-3 border border-gray-200 font-medium text-gray-700 bg-blue-50">
                {item1.name}
              </th>
              
              {safeItems.map((item2, colIndex) => {
                const isEqual = item1.id === item2.id;
                const value = getComparisonValue(item1.id, item2.id);
                
                return (
                  <td 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    className={`px-2 py-2 border border-gray-200 text-center ${
                      isEqual ? 'bg-gray-100' : ''
                    }`}
                  >
                    {isEqual ? (
                      <span className="font-bold text-lg">1</span>
                    ) : (
                      <select
                        value={value}
                        onChange={e => handleComparisonChange(item1.id, item2.id, parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-black text-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                        disabled={item2.id < item1.id || readOnly} // Chỉ cho phép sửa nửa trên của ma trận và khi không ở chế độ chỉ đọc
                        title={item2.id < item1.id ? "Sử dụng ô đối xứng để chỉnh sửa" : "Chọn mức độ quan trọng"}
                        style={{
                          appearance: 'none', 
                          paddingRight: '16px', 
                          background: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27%3E%3Cpath fill=%27%23888%27 d=%27M6 8l6-8H0z%27/%3E%3C/svg%3E") no-repeat right 0.5rem center/8px 8px',
                        }}
                      >
                        {COMPARISON_SCALE.map(scale => {
                          // Lấy giá trị hiển thị rút gọn (chỉ số)
                          const shortValue = typeof scale.value === 'number' && scale.value < 1 
                            ? `1/${Math.round(1/scale.value)}` // Đổi số thập phân thành phân số, ví dụ: 0.2 -> "1/5"
                            : scale.value.toString();
                          
                          return (
                            <option 
                              key={`option-${scale.value}`} 
                              value={scale.value}
                              className="font-normal p-1 text-black"
                              data-full-label={scale.label}
                            >
                              {shortValue}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn so sánh cặp:</h4>
        <p className="text-blue-700 text-sm">
          So sánh tầm quan trọng của mục ở hàng ngang so với mục ở cột dọc. Ví dụ, nếu "Học tập" 
          quan trọng hơn "Giải trí" 5 lần, chọn "5 - Quan trọng cao" ở ô tương ứng.
        </p>
      </div>
    </div>
  );
};

export default ComparisonMatrix;
