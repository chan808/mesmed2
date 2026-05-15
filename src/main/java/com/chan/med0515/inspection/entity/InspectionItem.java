package com.chan.med0515.inspection.entity;

import com.chan.med0515.global.entity.BaseEntity;
import com.chan.med0515.material.entity.Material;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.Assert;

import java.time.LocalDateTime;

@Entity
@Table(name = "inspection_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLRestriction("deleted_at is null")
public class InspectionItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false, length = 100)
    private String itemName;        // 검사항목

    @Column(length = 200)
    private String specification;   // 규격 Spec

    @Column(length = 50)
    private String method;          // 검사 방법

    @Column(length = 100)
    private String equipment;       // 측정기기

    @Column(length = 50)
    private String timing;          // 주기

    @Column(nullable = false)
    private Integer sortOrder;      // 표출 순서

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public InspectionItem(Material material, String itemName, String specification,
                          String method, String equipment, String timing,
                          Integer sortOrder) {
        Assert.notNull(material, "자재는 필수입니다");
        Assert.hasText(itemName, "검사항목은 필수입니다");
        Assert.notNull(sortOrder, "정렬순서는 필수입니다");
        this.material = material;
        this.itemName = itemName;
        this.specification = specification;
        this.method = method;
        this.equipment = equipment;
        this.timing = timing;
        this.sortOrder = sortOrder;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}