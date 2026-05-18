package com.chan.med0515.inspection.controller;

import com.chan.med0515.global.response.ApiResponse;
import com.chan.med0515.inspection.dto.*;
import com.chan.med0515.inspection.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;

    @PostMapping("/standards")
    public ResponseEntity<ApiResponse<InspectionStandardResponse>> registerStandard(
            @Valid @RequestBody InspectionStandardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(inspectionService.registerStandard(request)));
    }

    @GetMapping("/standards")
    public ResponseEntity<ApiResponse<List<InspectionStandardResponse>>> findStandardsByMaterial(
            @RequestParam Long materialId) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.findStandardsByMaterial(materialId)));
    }

    @GetMapping("/standards/{id}")
    public ResponseEntity<ApiResponse<InspectionStandardResponse>> findStandardById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.findStandardById(id)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<InspectionItemResponse>> addItem(
            @Valid @RequestBody InspectionItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(inspectionService.addItem(request)));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<InspectionItemResponse>>> findItemsByStandard(
            @RequestParam Long standardId) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.findItemsByStandard(standardId)));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inspectionService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/revisions")
    public ResponseEntity<ApiResponse<RevisionHistoryResponse>> addRevision(
            @Valid @RequestBody RevisionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(inspectionService.addRevision(request)));
    }

    @GetMapping("/revisions")
    public ResponseEntity<ApiResponse<List<RevisionHistoryResponse>>> findRevisionsByStandard(
            @RequestParam Long standardId) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.findRevisionsByStandard(standardId)));
    }
}