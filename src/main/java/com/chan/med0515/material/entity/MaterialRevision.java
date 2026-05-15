package com.chan.med0515.material.entity;

import com.chan.med0515.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.Assert;

import java.time.LocalDate;

@Entity
@Table(name = "material_revision")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MaterialRevision extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false)
    private Integer revisionNumber;

    @Column(nullable = false)
    private LocalDate revisionDate;

    @Column(nullable = false, length = 200)
    private String revisionNote;

    @Column(length = 50)
    private String confirmedBy;

    @Builder
    public MaterialRevision(Material material, Integer revisionNumber,
                            LocalDate revisionDate, String revisionNote,
                            String confirmedBy) {
        Assert.notNull(material, "자재는 필수입니다");
        Assert.notNull(revisionNumber, "개정번호는 필수입니다");
        Assert.notNull(revisionDate, "개정일은 필수입니다");
        Assert.hasText(revisionNote, "개정내용은 필수입니다");
        this.material = material;
        this.revisionNumber = revisionNumber;
        this.revisionDate = revisionDate;
        this.revisionNote = revisionNote;
        this.confirmedBy = confirmedBy;
    }
}