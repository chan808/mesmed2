package com.chan.med0515.inspection.repository;

import com.chan.med0515.inspection.entity.RevisionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RevisionHistoryRepository extends JpaRepository<RevisionHistory, Long> {

    List<RevisionHistory> findAllByStandardIdOrderByRevAsc(Long standardId);
}
