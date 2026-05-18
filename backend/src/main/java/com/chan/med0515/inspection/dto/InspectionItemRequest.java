package com.chan.med0515.inspection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InspectionItemRequest(

        @NotNull
        Long standardId,

        @NotBlank
        String itemName,

        String specification,

        String method,

        String equipment,

        String timing
) {
}
