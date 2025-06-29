package com.example.nweeter_backend.modle;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Entity
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String profileImage;

    @Column
    private String profileImageKey;

    @Column
    private String provider;

    @Column
    private String providerId;

    @CreationTimestamp
    @Column(name = "time_ins")
    private LocalDateTime insertTime;

    @UpdateTimestamp
    @Column(name = "time_upd")
    private LocalDateTime updateTime;
}