package com.chan.med0515.inspection.dto;

import com.chan.med0515.inspection.entity.RevisionHistory;

import java.time.LocalDate;

public record RevisionHistoryResponse(
        Long id,
        Long standardId,
        int rev,
        LocalDate revisionDate,
        String revisionNote,
        String confirmedBy
) {
    public static RevisionHistoryResponse from(RevisionHistory r) {
        return new RevisionHistoryResponse(
                r.getId(),
                r.getStandard().getId(),
                r.getRev(),
                r.getRevisionDate(),
                r.getRevisionNote(),
                r.getConfirmedBy()
        );
    }
}