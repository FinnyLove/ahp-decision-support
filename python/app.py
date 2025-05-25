from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json

app = Flask(__name__)
CORS(app)  # Cho phép CORS để frontend có thể gọi API

def normalize_matrix(matrix):
    """Chuẩn hóa ma trận bằng cách chia mỗi ô cho tổng của cột."""
    col_sums = np.sum(matrix, axis=0)
    return matrix / col_sums

def calculate_weights(matrix):
    """Tính trọng số từ ma trận so sánh chuẩn hóa."""
    normalized = normalize_matrix(matrix)
    return np.mean(normalized, axis=1)

def calculate_consistency_ratio(matrix, weights):
    """Tính tỷ số nhất quán (CR) của ma trận so sánh."""
    n = len(weights)
    
    # Tính λmax
    weighted_sum = np.dot(matrix, weights)
    consistency_vector = weighted_sum / weights
    lambda_max = np.mean(consistency_vector)
    
    # Tính chỉ số nhất quán (CI)
    ci = (lambda_max - n) / (n - 1)
    
    # Chỉ số ngẫu nhiên (RI) dựa trên kích thước ma trận
    ri_values = {1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
    ri = ri_values.get(n, 1.5)  # Giá trị mặc định cho n > 10
    
    # Tính tỷ số nhất quán (CR)
    cr = ci / ri if ri != 0 else 0
    
    # Kiểm tra tính nhất quán (CR < 0.1 = 10%)
    is_consistent = cr < 0.1
    
    # Trả về kết quả với các giá trị đã được chuyển thành số thực
    return {
        'lambda_max': float(lambda_max),
        'ci': float(ci),
        'ri': float(ri),
        'cr': float(cr),
        'is_consistent': int(is_consistent)  # Chuyển boolean thành 0/1 để tránh lỗi serialize
    }

def ahp_analysis(criteria_matrix, alternatives_matrices):
    """Phân tích AHP cho ma trận tiêu chí và ma trận phương án."""
    print("Bắt đầu phân tích AHP...")
    
    # Tính trọng số tiêu chí
    criteria_matrix_np = np.array(criteria_matrix, dtype=float)
    criteria_weights = calculate_weights(criteria_matrix_np)
    print(f"Trọng số tiêu chí: {criteria_weights}")
    
    # Kiểm tra tính nhất quán của ma trận tiêu chí
    criteria_consistency = calculate_consistency_ratio(criteria_matrix_np, criteria_weights)
    print(f"Tỷ số nhất quán (CR) tiêu chí: {criteria_consistency['cr']:.4f}")
    
    # Chuẩn bị kết quả ban đầu (trường hợp không có phương án)
    result = {
        'criteria_weights': criteria_weights.tolist(),
        'criteria_consistency': criteria_consistency,
        'alternatives_weights': [],
        'alternatives_consistency': [],
        'final_scores': [],
    }
    
    # Nếu không có phương án, trả về kết quả từ bước tính tiêu chí
    if not alternatives_matrices:
        print("Không có ma trận phương án, chỉ tính trọng số tiêu chí.")
        return result
    
    # Xử lý các phương án nếu có
    print(f"Xử lý {len(alternatives_matrices)} ma trận phương án...")
    alternatives_weights = []
    alternatives_consistency = []
    
    # Tính trọng số cho mỗi phương án theo từng tiêu chí
    for i, alt_matrix in enumerate(alternatives_matrices):
        print(f"Xử lý ma trận phương án {i+1}...")
        alt_matrix_np = np.array(alt_matrix, dtype=float)
        alt_weights = calculate_weights(alt_matrix_np)
        alt_consistency = calculate_consistency_ratio(alt_matrix_np, alt_weights)
        
        alternatives_weights.append(alt_weights.tolist())
        alternatives_consistency.append(alt_consistency)
    
    # Chỉ tính điểm tổng hợp nếu có ít nhất một ma trận phương án
    if alternatives_weights:
        # Chuyển alternatives_weights thành ma trận (m phương án x n tiêu chí)
        alt_weights_matrix = np.array(alternatives_weights).T
        
        # Kiểm tra kích thước ma trận trước khi thực hiện phép nhân ma trận
        if alt_weights_matrix.shape[1] == len(criteria_weights):
            # Nhân ma trận trọng số phương án với vector trọng số tiêu chí
            final_scores = np.dot(alt_weights_matrix, criteria_weights).tolist()
            result['final_scores'] = final_scores
        else:
            print(f"Cảnh báo: Kích thước ma trận không phù hợp cho phép tính điểm cuối cùng")
            print(f"Ma trận trọng số phương án: {alt_weights_matrix.shape}, Vector trọng số tiêu chí: {criteria_weights.shape}")
    
    # Cập nhật kết quả với trọng số phương án và tỷ số nhất quán
    result['alternatives_weights'] = alternatives_weights
    result['alternatives_consistency'] = alternatives_consistency
    
    return result

@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        print("Nhận yêu cầu tính toán AHP...")
        
        # Lấy dữ liệu từ request
        data = request.json
        print(f"Dữ liệu nhận được: {data}")
        
        if not data:
            return jsonify({'error': 'Không có dữ liệu được gửi lên'}), 400
            
        if 'criteria_matrix' not in data:
            return jsonify({'error': 'Thiếu ma trận tiêu chí (criteria_matrix)'}), 400
            
        if 'alternatives_matrices' not in data:
            return jsonify({'error': 'Thiếu ma trận phương án (alternatives_matrices)'}), 400
        
        criteria_matrix = data['criteria_matrix']
        alternatives_matrices = data['alternatives_matrices']
        criteria_names = data.get('criteria_names', [])
        alternative_names = data.get('alternative_names', [])
        
        # Kiểm tra dữ liệu và định dạng ma trận
        if not isinstance(criteria_matrix, list):
            return jsonify({'error': 'Ma trận tiêu chí phải là một mảng 2 chiều'}), 400
            
        print(f"Kích thước ma trận tiêu chí: {len(criteria_matrix)}x{len(criteria_matrix[0]) if criteria_matrix else 0}")
        
        # Kiểm tra kích thước ma trận tiêu chí
        n_criteria = len(criteria_matrix)
        if n_criteria < 2:
            return jsonify({'error': 'Cần ít nhất 2 tiêu chí để thực hiện phân tích AHP'}), 400
            
        # Kiểm tra ma trận vuông
        for i, row in enumerate(criteria_matrix):
            if len(row) != n_criteria:
                return jsonify({'error': f'Ma trận tiêu chí không vuông. Hàng {i+1} có {len(row)} cột nhưng cần {n_criteria}'}), 400
        
        # Kiểm tra ma trận từng tiêu chí nếu có
        n_alternatives = len(alternatives_matrices[0]) if alternatives_matrices else 0
        for i, matrix in enumerate(alternatives_matrices):
            if len(matrix) != n_alternatives:
                return jsonify({'error': f'Ma trận phương án cho tiêu chí {i+1} không đúng kích thước'}), 400
            for j, row in enumerate(matrix):
                if len(row) != n_alternatives:
                    return jsonify({'error': f'Ma trận phương án cho tiêu chí {i+1}, hàng {j+1} không đúng kích thước'}), 400
        
        print("Kiểm tra ma trận OK, bắt đầu phân tích AHP...")
                
        # Hiển thị ma trận để debug
        print("Ma trận tiêu chí:")
        for row in criteria_matrix:
            print(row)
        
        # Đảm bảo ma trận tiêu chí chỉ chứa số thực hợp lệ
        for i in range(n_criteria):
            for j in range(n_criteria):
                # Đảm bảo đường chéo là 1
                if i == j:
                    criteria_matrix[i][j] = 1.0
                # Đảm bảo không có số 0 (tránh chia cho 0)
                elif criteria_matrix[i][j] == 0:
                    criteria_matrix[i][j] = 1.0
                # Đảm bảo tất cả là số thực
                else:
                    try:
                        criteria_matrix[i][j] = float(criteria_matrix[i][j])
                    except (ValueError, TypeError):
                        criteria_matrix[i][j] = 1.0
        
        # Phân tích AHP
        result = ahp_analysis(criteria_matrix, alternatives_matrices)
        
        # Thêm tên tiêu chí và phương án vào kết quả
        if criteria_names:
            result['criteria_names'] = criteria_names
        if alternative_names:
            result['alternative_names'] = alternative_names
            
        print("Phân tích AHP thành công.")
        return jsonify(result)
        
    except ValueError as ve:
        error_msg = f"Lỗi giá trị: {str(ve)}"
        print(error_msg)
        return jsonify({'error': error_msg}), 400
        
    except Exception as e:
        import traceback
        error_msg = f"Lỗi không mong muốn: {str(e)}"
        print(error_msg)
        print(traceback.format_exc())
        return jsonify({'error': error_msg, 'traceback': traceback.format_exc()}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)