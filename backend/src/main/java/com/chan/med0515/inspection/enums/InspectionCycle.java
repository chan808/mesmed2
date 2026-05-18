package com.chan.med0515.inspection.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum InspectionCycle {
    UPON_RECEIPT("입고 시"),
    REGULAR("정기"),
    PERIODIC("주기적");

    private final String description;
}
