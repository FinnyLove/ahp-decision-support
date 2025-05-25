// Các loại dữ liệu cho ứng dụng AHP

export interface Criterion {
  id: string;
  name: string;
  description: string;
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
}

export interface AHPProblem {
  id: string;
  title: string;
  description: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  createdAt: string;
}

export interface CriteriaComparison {
  criteriaId1: string;
  criteriaId2: string;
  value: number;
}

export interface AlternativeComparison {
  criteriaId: string;
  alternativeId1: string;
  alternativeId2: string;
  value: number;
}

export interface AHPComparisons {
  criteriaComparisons: Record<string, number>;
  alternativeComparisons: Record<string, Record<string, number>>;
}

export interface AHPResult {
  criteria_weights: number[];
  criteria_consistency: {
    lambda_max: number;
    ci: number;
    ri: number;
    cr: number;
    is_consistent: boolean;
  };
  alternatives_weights: number[][];
  alternatives_consistency: {
    lambda_max: number;
    ci: number;
    ri: number;
    cr: number;
    is_consistent: boolean;
  }[];
  final_scores: number[];
  criteria_names?: string[];
  alternative_names?: string[];
}

// Kiểu dữ liệu cho lựa chọn mode
export type AHPMode = 'student-expense' | 'custom' | 'ai-assisted';

// Các tiêu chí mặc định cho chi tiêu sinh viên
export const DEFAULT_STUDENT_CRITERIA: Criterion[] = [
  { id: 'study', name: 'Học tập', description: 'Chi phí liên quan đến học tập, sách vở, khóa học' },
  { id: 'housing', name: 'Nơi ở', description: 'Chi phí thuê nhà, ký túc xá, tiện ích' },
  { id: 'healthcare', name: 'Chữa bệnh', description: 'Chi phí khám chữa bệnh, bảo hiểm y tế' },
  { id: 'food', name: 'Ăn uống', description: 'Chi phí ăn uống hàng ngày' },
  { id: 'entertainment', name: 'Giải trí', description: 'Chi phí giải trí, thể thao, du lịch' },
  { id: 'transportation', name: 'Di chuyển', description: 'Chi phí di chuyển, xăng xe, vé xe buýt' },
  { id: 'unexpected', name: 'Phát sinh', description: 'Chi phí phát sinh ngoài dự kiến' }
];

// Thang điểm so sánh cặp (Saaty scale)
export const COMPARISON_SCALE = [
  { value: 9, label: '9 - Quan trọng tuyệt đối' },
  { value: 8, label: '8' },
  { value: 7, label: '7 - Quan trọng rất cao' },
  { value: 6, label: '6' },
  { value: 5, label: '5 - Quan trọng cao' },
  { value: 4, label: '4' },
  { value: 3, label: '3 - Quan trọng vừa phải' },
  { value: 2, label: '2' },
  { value: 1, label: '1 - Quan trọng như nhau' },
  { value: 1/2, label: '1/2' },
  { value: 1/3, label: '1/3 - Kém quan trọng vừa phải' },
  { value: 1/4, label: '1/4' },
  { value: 1/5, label: '1/5 - Kém quan trọng cao' },
  { value: 1/6, label: '1/6' },
  { value: 1/7, label: '1/7 - Kém quan trọng rất cao' },
  { value: 1/8, label: '1/8' },
  { value: 1/9, label: '1/9 - Kém quan trọng tuyệt đối' }
];
