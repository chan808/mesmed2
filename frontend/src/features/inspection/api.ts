import { api, unwrap } from '../../shared/api/client';
import type { ApiResponse } from '../../shared/api/types';
import type {
  InspectionStandard,
  InspectionStandardRequest,
  InspectionItem,
  RevisionHistory,
  RevisionRequest,
} from './types';

export const inspectionApi = {
  // Standards
  createStandard: (body: InspectionStandardRequest) =>
    unwrap(api.post<ApiResponse<InspectionStandard>>('/inspections/standards', body)),
  listStandards: (materialId: number) =>
    unwrap(api.get<ApiResponse<InspectionStandard[]>>('/inspections/standards', { params: { materialId } })),
  getStandard: (id: number) =>
    unwrap(api.get<ApiResponse<InspectionStandard>>(`/inspections/standards/${id}`)),

  // Items (조회 전용 — 추가/삭제는 개정(revision)을 통해서만)
  listItems: (standardId: number) =>
    unwrap(api.get<ApiResponse<InspectionItem[]>>('/inspections/items', { params: { standardId } })),

  // Revisions — 항목 추가/삭제 + 개정 이력을 한 번에 처리
  addRevision: (body: RevisionRequest) =>
    unwrap(api.post<ApiResponse<RevisionHistory>>('/inspections/revisions', body)),
  listRevisions: (standardId: number) =>
    unwrap(api.get<ApiResponse<RevisionHistory[]>>('/inspections/revisions', { params: { standardId } })),
};
