package com.chan.med0515.inspection.service;

import com.chan.med0515.global.error.BusinessException;
import com.chan.med0515.inspection.dto.*;
import com.chan.med0515.inspection.entity.InspectionItem;
import com.chan.med0515.inspection.entity.InspectionStandard;
import com.chan.med0515.inspection.entity.RevisionHistory;
import com.chan.med0515.inspection.error.InspectionErrorCode;
import com.chan.med0515.inspection.repository.InspectionItemRepository;
import com.chan.med0515.inspection.repository.InspectionStandardRepository;
import com.chan.med0515.inspection.repository.RevisionHistoryRepository;
import com.chan.med0515.material.entity.Material;
import com.chan.med0515.material.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionService {

    private final InspectionStandardRepository standardRepository;
    private final InspectionItemRepository itemRepository;
    private final RevisionHistoryRepository revisionRepository;
    private final MaterialService materialService;

    @Transactional
    public InspectionStandardResponse registerStandard(InspectionStandardRequest request) {
        Material material = materialService.getEntityById(request.materialId());
        InspectionStandard standard = InspectionStandard.builder()
                .material(material)
                .rev(0)
                .establishedAt(request.establishedAt())
                .inspectionType(request.inspectionType())
                .inspectionLevel(request.inspectionLevel())
                .strictness(request.strictness())
                .aql(request.aql())
                .aqlAc(request.aqlAc())
                .aqlRe(request.aqlRe())
                .build();
        return InspectionStandardResponse.from(standardRepository.save(standard));
    }

    public List<InspectionStandardResponse> findStandardsByMaterial(Long materialId) {
        return standardRepository.findAllByMaterialId(materialId).stream()
                .map(InspectionStandardResponse::from)
                .toList();
    }

    public InspectionStandardResponse findStandardById(Long id) {
        return standardRepository.findById(id)
                .map(InspectionStandardResponse::from)
                .orElseThrow(() -> new BusinessException(InspectionErrorCode.STANDARD_NOT_FOUND));
    }

    @Transactional
    public InspectionItemResponse addItem(InspectionItemRequest request) {
        InspectionStandard standard = standardRepository.findById(request.standardId())
                .orElseThrow(() -> new BusinessException(InspectionErrorCode.STANDARD_NOT_FOUND));
        InspectionItem item = InspectionItem.builder()
                .standard(standard)
                .itemName(request.itemName())
                .specification(request.specification())
                .method(request.method())
                .equipment(request.equipment())
                .timing(request.timing())
                .build();
        return InspectionItemResponse.from(itemRepository.save(item));
    }

    public List<InspectionItemResponse> findItemsByStandard(Long standardId) {
        return itemRepository.findAllByStandardId(standardId).stream()
                .map(InspectionItemResponse::from)
                .toList();
    }

    @Transactional
    public void deleteItem(Long itemId) {
        InspectionItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException(InspectionErrorCode.ITEM_NOT_FOUND));
        item.softDelete();
    }

    @Transactional
    public RevisionHistoryResponse addRevision(RevisionRequest request) {
        InspectionStandard standard = standardRepository.findById(request.standardId())
                .orElseThrow(() -> new BusinessException(InspectionErrorCode.STANDARD_NOT_FOUND));
        standard.incrementRev();
        RevisionHistory revision = RevisionHistory.builder()
                .standard(standard)
                .rev(standard.getRev())
                .revisionDate(request.revisionDate())
                .revisionNote(request.revisionNote())
                .confirmedBy(request.confirmedBy())
                .build();
        return RevisionHistoryResponse.from(revisionRepository.save(revision));
    }

    public List<RevisionHistoryResponse> findRevisionsByStandard(Long standardId) {
        return revisionRepository.findAllByStandardIdOrderByRevAsc(standardId).stream()
                .map(RevisionHistoryResponse::from)
                .toList();
    }
}
