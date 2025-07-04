package com.example.nweeter_backend.modle;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class ImageInBoard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String imageUrl;

    @Column
    private String imageLocation;

    @Column
    private Long boardId;

    @Column
    @Enumerated(value = EnumType.STRING)
    private State state;

    @CreationTimestamp
    @Column(name = "time_ins")
    private LocalDateTime insertTime;

    @UpdateTimestamp
    @Column(name = "time_upd")
    private LocalDateTime updateTime;

    public enum State {
        PENDING, CONFIRMED
    }

}
