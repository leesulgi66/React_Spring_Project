package com.example.nweeter_backend.controller;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.dto.BoardRequestDto;
import com.example.nweeter_backend.dto.BoardResponseDto;
import com.example.nweeter_backend.service.BoardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestController
@RequestMapping("/api")
public class BoardApiController {

    final private BoardService boardService;
    @Autowired
    public BoardApiController(BoardService boardService) {
        this.boardService = boardService;
    }

    @PostMapping("/board")
    public ResponseEntity<String> boardPost(@ModelAttribute BoardRequestDto dto, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board post call");
        int byteSize = dto.getTweet().getBytes(StandardCharsets.UTF_8).length;
        System.out.println("tweet size : "+byteSize);
        boardService.save(dto, principal.getMember());
        return new ResponseEntity<>("save ok", HttpStatus.OK);
    }

    @GetMapping("/board")
    public ResponseEntity<Page<BoardResponseDto>> allBoards(@PageableDefault(size=10, sort="id", direction = Sort.Direction.DESC)Pageable pageable) {
        log.info("all boards get call");
        Page<BoardResponseDto> allBoards = boardService.getAllBoards(pageable);
        return new ResponseEntity<>(allBoards, HttpStatus.OK);
    }

    @GetMapping("/board/user")
    public ResponseEntity<Page<BoardResponseDto>> BoardsByMember(@PageableDefault(size=10, sort="id", direction = Sort.Direction.DESC)Pageable pageable, @AuthenticationPrincipal PrincipalDetails principal) {
        log.info("boards by member get call");
        Page<BoardResponseDto> allBoards = boardService.getMemberBoards(pageable, principal.getMember().getId());
        return new ResponseEntity<>(allBoards, HttpStatus.OK);
    }

    @DeleteMapping ("/board/{id}")
    public ResponseEntity<String> boardDelete(@PathVariable Long id, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board delete call");
        boardService.delete(id);
        return new ResponseEntity<>("delete ok", HttpStatus.OK);
    }

    @PutMapping("/board")
    public ResponseEntity<String> boardEdit(@ModelAttribute BoardRequestDto dto, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board edit call");
        Long num = Long.parseLong(dto.getBoardId());
        dto.setId(num);
        boardService.edit(dto, principal.getMember());
        return new ResponseEntity<>("edit ok", HttpStatus.OK);
    }
}
