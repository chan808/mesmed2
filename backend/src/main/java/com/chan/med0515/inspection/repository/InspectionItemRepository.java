package com.chan.med0515.inspection.repository;

import com.chan.med0515.inspection.entity.InspectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionItemRepository extends JpaRepository<InspectionItem, Long> {

    List<InspectionItem> findAllByStandardId(Long StandardId);
}
