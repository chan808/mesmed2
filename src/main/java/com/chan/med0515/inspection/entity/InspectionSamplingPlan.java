package com.chan.med0515.inspection.entity;

import com.chan.med0515.global.entity.BaseEntity;
import com.chan.med0515.material.entity.Material;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.Assert;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "inspection_sampling_plan",
        indexes = @Index(name = "idx_sampling_plan_material_date",
                columnList = "material_id, effective_date"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InspectionSamplingPlan extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false, length = 20)
    private String inspectionType;      // 전수검사 / Sample검사

    @Column(length = 20)
    private String inspectionLevel;     // G-I / G-II / G-III

    @Column(length = 20)
    private String strictness;          // 보통 / 까다로운 / 수월한

    @Column(precision = 4, scale = 1)
    private BigDecimal aql;             // 2.5

    @Column
    private Integer aqlAc;             // 합격판정개수

    @Column
    private Integer aqlRe;             // 불합격판정개수

    @Column(nullable = false)
    private LocalDate effectiveDate;    // 적용 시작일

    @Builder
    public InspectionSamplingPlan(Material material, String inspectionType,
                                  String inspectionLevel, String strictness,
                                  BigDecimal aql, Integer aqlAc, Integer aqlRe,
                                  LocalDate effectiveDate) {
        Assert.notNull(material, "자재는 필수입니다");
        Assert.hasText(inspectionType, "검사 방식은 필수입니다");
        Assert.notNull(effectiveDate, "적용일은 필수입니다");
        this.material = material;
        this.inspectionType = inspectionType;
        this.inspectionLevel = inspectionLevel;
        this.strictness = strictness;
        this.aql = aql;
        this.aqlAc = aqlAc;
        this.aqlRe = aqlRe;
        this.effectiveDate = effectiveDate;
    }
}