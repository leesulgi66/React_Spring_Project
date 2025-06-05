package com.example.nweeter_backend.repository;

import com.example.nweeter_backend.modle.Board;
import com.example.nweeter_backend.modle.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface BoardRepository extends JpaRepository<Board, Long> {
    @Query(value = "SELECT * FROM board WHERE member_id = ?1",nativeQuery = true)
    Page<Board> boards(Long member_id, Pageable pageable);

    @Modifying // delete, update 등에 붙여주어야 한다.
    @Transactional
    @Query(value = "DELETE FROM board WHERE member_id = ?1",nativeQuery = true)
    int boards(Long member_id);
    //void deleteAllByMember(Member member); // 위와 같음
}
