import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { materialApi } from './api';
import { inspectionApi } from '../inspection/api';
import { useAuth } from '../../shared/auth/useAuth';
import type {
  InspectionStandardRequest,
  InspectionItemRequest,
  RevisionRequest,
  InspectionItem,
} from '../inspection/types';

export function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const materialId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [showStandardForm, setShowStandardForm] = useState(false);

  // 개정 모달에 넘길 초기 항목 변경 정보 (항목 추가 버튼 → 모달 오픈 시 사용)
  const [pendingAddItems, setPendingAddItems] = useState<InspectionItemRequest[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedStandardId, setSelectedStandardId] = useState<number | null>(null);

  const { data: material, isLoading: materialLoading } = useQuery({
    queryKey: ['materials', materialId],
    queryFn: () => materialApi.detail(materialId),
    enabled: !Number.isNaN(materialId),
  });

  const { data: standards, isLoading: standardsLoading } = useQuery({
    queryKey: ['materials', materialId, 'standards'],
    queryFn: () => inspectionApi.listStandards(materialId),
    enabled: !Number.isNaN(materialId),
  });

  const currentStandard = standards?.find(
    (s) => s.id === (selectedStandardId ?? (standards.length > 0 ? standards[standards.length - 1].id : null))
  );

  const { data: items } = useQuery({
    queryKey: ['standards', currentStandard?.id, 'items'],
    queryFn: () => inspectionApi.listItems(currentStandard!.id),
    enabled: !!currentStandard,
  });

  const { data: revisions } = useQuery({
    queryKey: ['standards', currentStandard?.id, 'revisions'],
    queryFn: () => inspectionApi.listRevisions(currentStandard!.id),
    enabled: !!currentStandard,
  });

  const createStandard = useMutation({
    mutationFn: inspectionApi.createStandard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', materialId, 'standards'] });
      setShowStandardForm(false);
    },
  });

  const addRevision = useMutation({
    mutationFn: inspectionApi.addRevision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', materialId, 'standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards', currentStandard?.id, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['standards', currentStandard?.id, 'revisions'] });
      setPendingAddItems([]);
      setPendingDeleteIds([]);
      setShowRevisionForm(false);
      setIsEditMode(false);
    },
  });

  // 항목 추가 의도 (Draft)
  const handleAddItemIntent = (item: InspectionItemRequest) => {
    setPendingAddItems([...pendingAddItems, item]);
  };

  // 항목 삭제 의도 (Draft)
  const handleDeleteItemIntent = (itemId: number) => {
    setPendingDeleteIds([...pendingDeleteIds, itemId]);
  };

  if (materialLoading || standardsLoading) return <p className="empty">로딩 중…</p>;
  if (!material) return <p className="empty">자재를 찾을 수 없습니다.</p>;

  return (
    <div className="inspection-standard-view">
      <div className="content-header">
        <h1>검사기준 관리</h1>
        <div className="row" style={{ gap: 8 }}>
          {standards && standards.length > 0 && (
            <select
              value={currentStandard?.id}
              onChange={(e) => setSelectedStandardId(Number(e.target.value))}
            >
              {standards.map((s) => (
                <option key={s.id} value={s.id}>
                  Rev.{s.rev} ({s.establishedAt})
                </option>
              ))}
            </select>
          )}
          {isAdmin && (
            <button className="primary" onClick={() => setShowStandardForm(true)}>
              기준서 제정
            </button>
          )}
          <button onClick={() => navigate('/materials')}>목록으로</button>
        </div>
      </div>

      {/* 1. 기준서 헤더 */}
      <div className="section standard-header">
        <table>
          <tbody>
            <tr>
              <th>모델명</th>
              <td>{material.modelName}</td>
              <th>제정일</th>
              <td>{currentStandard?.establishedAt ?? '-'}</td>
            </tr>
            <tr>
              <th>품 명</th>
              <td>{material.partName}</td>
              <th>검사 방식</th>
              <td>{currentStandard?.inspectionType ?? '-'}</td>
            </tr>
            <tr>
              <th>품 번</th>
              <td>{material.partCode ?? '-'}</td>
              <th>검사 수준</th>
              <td>{currentStandard?.inspectionLevel ?? '-'}</td>
            </tr>
            <tr>
              <th>공급자</th>
              <td>{material.suppier ?? '-'}</td>
              <th>검사의 엄격도</th>
              <td>{currentStandard?.strictness ?? '-'}</td>
            </tr>
            <tr>
              <th>규격 or 재질</th>
              <td>{material.materialSpec ?? '-'}</td>
              <th>AQL</th>
              <td>
                {currentStandard
                  ? `${currentStandard.aql ?? '-'} (Ac: ${currentStandard.aqlAc ?? '-'}, Re: ${currentStandard.aqlRe ?? '-'})`
                  : '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 검사항목 */}
      <div className="section">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="section-title">검사항목</div>
          {isAdmin && currentStandard && (
            isEditMode ? (
              <div className="row" style={{ gap: 8 }}>
                <AddItemInlineForm onConfirm={handleAddItemIntent} />
                <button className="primary" onClick={() => setShowRevisionForm(true)}>최종 개정 저장</button>
                <button onClick={() => {
                  setIsEditMode(false);
                  setPendingAddItems([]);
                  setPendingDeleteIds([]);
                }}>취소</button>
              </div>
            ) : (
              <button onClick={() => setIsEditMode(true)}>개정 편집 모드</button>
            )
          )}
        </div>
        <table>
          <thead>
            <tr>
              <th>검사항목</th>
              <th>규격(Spec)</th>
              <th>검사 방법</th>
              <th>측정기기</th>
              <th>주기</th>
              {isAdmin && <th style={{ width: 60 }} />}
            </tr>
          </thead>
          <tbody>
            {((items && items.length > 0) || pendingAddItems.length > 0) ? (
              <>
                {items?.map((item) => {
                  const isDeleted = pendingDeleteIds.includes(item.id);
                  return (
                    <tr key={item.id} style={{ textDecoration: isDeleted ? 'line-through' : 'none', color: isDeleted ? 'red' : 'inherit' }}>
                      <td>{item.itemName}</td>
                      <td>{item.specification ?? '-'}</td>
                      <td>{item.method ?? '-'}</td>
                      <td>{item.equipment ?? '-'}</td>
                      <td>{item.timing ?? '-'}</td>
                      {isAdmin && (
                        <td>
                          {isEditMode && !isDeleted && (
                            <button
                              className="small danger"
                              onClick={() => handleDeleteItemIntent(item.id)}
                            >
                              삭제
                            </button>
                          )}
                          {isEditMode && isDeleted && (
                            <button
                              className="small"
                              onClick={() => setPendingDeleteIds(pendingDeleteIds.filter(id => id !== item.id))}
                            >
                              취소
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {pendingAddItems.map((item, idx) => (
                  <tr key={`new-${idx}`} style={{ color: 'green', fontWeight: 'bold' }}>
                    <td>{item.itemName} (신규)</td>
                    <td>{item.specification ?? '-'}</td>
                    <td>{item.method ?? '-'}</td>
                    <td>{item.equipment ?? '-'}</td>
                    <td>{item.timing ?? '-'}</td>
                    {isAdmin && (
                      <td>
                        {isEditMode && (
                          <button
                            className="small danger"
                            onClick={() => setPendingAddItems(pendingAddItems.filter((_, i) => i !== idx))}
                          >
                            제거
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="empty">
                  등록된 검사항목이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. 개정 이력 */}
      <div className="section">
        <div className="section-title" style={{ marginBottom: 8 }}>개정 이력</div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>Rev</th>
              <th style={{ width: 120 }}>개정일</th>
              <th>개정내용</th>
              <th style={{ width: 100 }}>확인</th>
            </tr>
          </thead>
          <tbody>
            {revisions && revisions.length > 0 ? (
              revisions.map((rev) => (
                <tr key={rev.id}>
                  <td className="num">{rev.rev}</td>
                  <td>{rev.revisionDate}</td>
                  <td>{rev.revisionNote}</td>
                  <td>{rev.confirmedBy ?? '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty">
                  개정 이력이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 기준서 제정 모달 */}
      {showStandardForm && (
        <StandardFormModal
          materialId={materialId}
          onClose={() => setShowStandardForm(false)}
          onSubmit={(data: InspectionStandardRequest) => createStandard.mutate(data)}
        />
      )}

      {/* 개정 이력 모달 — 최종 개정 저장 시 열림 */}
      {showRevisionForm && currentStandard && (
        <RevisionFormModal
          standardId={currentStandard.id}
          pendingAddItems={pendingAddItems}
          pendingDeleteIds={pendingDeleteIds}
          onClose={() => {
            setShowRevisionForm(false);
          }}
          onSubmit={(data: RevisionRequest) => addRevision.mutate(data)}
        />
      )}
    </div>
  );
}

// 항목 추가 인라인 폼 — "추가" 클릭 시 항목 입력, 확인하면 개정 모달로 넘어감
function AddItemInlineForm({ onConfirm }: { onConfirm: (item: InspectionItemRequest) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InspectionItemRequest>({
    itemName: '',
    specification: '',
    method: '육안',
    equipment: '육안확인',
    timing: '입고 시',
  });

  if (!open) {
    return (
      <button className="small" onClick={() => setOpen(true)}>
        + 항목 추가
      </button>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>검사항목 추가</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          추가된 항목은 '최종 개정 저장' 시 일괄 반영됩니다.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            onConfirm(form);
          }}
        >
          <div className="field">
            <label>검사항목</label>
            <input
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>규격(Spec)</label>
            <input
              value={form.specification}
              onChange={(e) => setForm({ ...form, specification: e.target.value })}
            />
          </div>
          <div className="field">
            <label>검사 방법</label>
            <input
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            />
          </div>
          <div className="field">
            <label>측정기기</label>
            <input
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            />
          </div>
          <div className="field">
            <label>주기</label>
            <input
              value={form.timing}
              onChange={(e) => setForm({ ...form, timing: e.target.value })}
            />
          </div>
          <div className="row-end">
            <button type="button" onClick={() => setOpen(false)}>
              취소
            </button>
            <button type="submit" className="primary">
              임시 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 개정 이력 모달 — 항목 변경 내역을 미리 보여주고 개정일/내용/확인자 입력
function RevisionFormModal({
  standardId,
  pendingAddItems,
  pendingDeleteIds,
  onClose,
  onSubmit,
}: {
  standardId: number;
  pendingAddItems: InspectionItemRequest[];
  pendingDeleteIds: number[];
  onClose: () => void;
  onSubmit: (data: RevisionRequest) => void;
}) {
  const [form, setForm] = useState({
    revisionDate: new Date().toISOString().split('T')[0],
    revisionNote: '',
    confirmedBy: '',
  });

  const hasChanges = pendingAddItems.length > 0 || pendingDeleteIds.length > 0;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>개정 이력 등록</h2>

        {/* 변경 내역 요약 */}
        {hasChanges && (
          <div className="revision-summary">
            {pendingAddItems.length > 0 && (
              <p>추가 항목: {pendingAddItems.map((i) => i.itemName).join(', ')}</p>
            )}
            {pendingDeleteIds.length > 0 && (
              <p>삭제 항목 ID: {pendingDeleteIds.join(', ')}</p>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              standardId,
              revisionDate: form.revisionDate,
              revisionNote: form.revisionNote,
              confirmedBy: form.confirmedBy || undefined,
              addItems: pendingAddItems.length > 0 ? pendingAddItems : undefined,
              deleteItemIds: pendingDeleteIds.length > 0 ? pendingDeleteIds : undefined,
            });
          }}
        >
          <div className="field">
            <label>개정일</label>
            <input
              type="date"
              value={form.revisionDate}
              onChange={(e) => setForm({ ...form, revisionDate: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>개정내용</label>
            <textarea
              value={form.revisionNote}
              onChange={(e) => setForm({ ...form, revisionNote: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>확인자</label>
            <input
              value={form.confirmedBy}
              onChange={(e) => setForm({ ...form, confirmedBy: e.target.value })}
            />
          </div>
          <div className="row-end">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="primary">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 기준서 제정 모달
function StandardFormModal({
  materialId,
  onClose,
  onSubmit,
}: {
  materialId: number;
  onClose: () => void;
  onSubmit: (data: InspectionStandardRequest) => void;
}) {
  const [form, setForm] = useState<InspectionStandardRequest>({
    materialId,
    establishedAt: new Date().toISOString().split('T')[0],
    inspectionType: 'Sample검사',
    inspectionLevel: 'II',
    strictness: '보통검사',
    aql: 2.5,
    aqlAc: 0,
    aqlRe: 1,
    revisionDate: new Date().toISOString().split('T')[0],
    revisionNote: '최초 제정',
    confirmedBy: '',
  });

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>검사기준서 제정</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
          <div className="field">
            <label>제정일</label>
            <input
              type="date"
              value={form.establishedAt}
              onChange={(e) => setForm({ ...form, establishedAt: e.target.value })}
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>검사 방식</label>
              <input
                value={form.inspectionType}
                onChange={(e) => setForm({ ...form, inspectionType: e.target.value })}
              />
            </div>
            <div className="field">
              <label>검사 수준</label>
              <input
                value={form.inspectionLevel}
                onChange={(e) => setForm({ ...form, inspectionLevel: e.target.value })}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>엄격도</label>
              <input
                value={form.strictness}
                onChange={(e) => setForm({ ...form, strictness: e.target.value })}
              />
            </div>
            <div className="field">
              <label>AQL</label>
              <input
                type="number"
                step="0.1"
                value={form.aql}
                onChange={(e) => setForm({ ...form, aql: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Ac (합격수)</label>
              <input
                type="number"
                value={form.aqlAc ?? 0}
                onChange={(e) => setForm({ ...form, aqlAc: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Re (불합격수)</label>
              <input
                type="number"
                value={form.aqlRe ?? 1}
                onChange={(e) => setForm({ ...form, aqlRe: Number(e.target.value) })}
              />
            </div>
          </div>
          <hr style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
          <div className="field-row">
            <div className="field">
              <label>제정(개정)일</label>
              <input
                type="date"
                value={form.revisionDate}
                onChange={(e) => setForm({ ...form, revisionDate: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>확인자</label>
              <input
                value={form.confirmedBy}
                onChange={(e) => setForm({ ...form, confirmedBy: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label>제정 사유</label>
            <textarea
              value={form.revisionNote}
              onChange={(e) => setForm({ ...form, revisionNote: e.target.value })}
              required
            />
          </div>
          <div className="row-end">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" className="primary">제정</button>
          </div>
        </form>
      </div>
    </div>
  );
}
