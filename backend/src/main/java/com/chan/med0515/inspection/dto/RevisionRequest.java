package com.chan.med0515.inspection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RevisionRequest(

        @NotNull
        Long standardId,

        @NotNull
        LocalDate revisionDate,

        @NotBlank @Size(max = 100)
        String revisionNote,

        @Size(max = 20)
        String confirmedBy
) {
}
