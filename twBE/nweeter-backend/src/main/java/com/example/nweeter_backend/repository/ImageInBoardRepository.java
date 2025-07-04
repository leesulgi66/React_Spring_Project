package com.example.nweeter_backend.repository;

import com.example.nweeter_backend.modle.ImageInBoard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageInBoardRepository extends JpaRepository<ImageInBoard, Long> {
    void deleteAllByState(ImageInBoard.State state);

    ImageInBoard findByImageLocation (String location);

    List<ImageInBoard> findAllByState (ImageInBoard.State state);

    List<ImageInBoard> findAllByBoardId (Long boardId);
}
