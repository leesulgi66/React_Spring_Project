package com.example.nweeter_backend.repository;

import com.example.nweeter_backend.modle.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUsername(String username);

    Optional<Member> findByEmail(String username);

    Optional<Member> findByProviderId(String id);

    boolean existsByEmail(String email);
}
