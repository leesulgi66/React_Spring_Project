package com.example.nweeter_backend.repository;

import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.modle.Reply;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReplyRepository extends JpaRepository<Reply, Long> {
    void deleteByMember(Member member);
}
