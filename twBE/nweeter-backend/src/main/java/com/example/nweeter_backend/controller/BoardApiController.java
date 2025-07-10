package com.example.nweeter_backend.controller;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.dto.BoardImageResponseDto;
import com.example.nweeter_backend.dto.BoardRequestDto;
import com.example.nweeter_backend.dto.BoardResponseDto;
import com.example.nweeter_backend.dto.ReplyRequestDto;
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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api")
public class BoardApiController {

    final private BoardService boardService;
    @Autowired
    public BoardApiController(BoardService boardService) {
        this.boardService = boardService;
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

    @PostMapping("/board")
    public ResponseEntity<String> boardPost(@ModelAttribute BoardRequestDto dto, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board post call");
        boardService.save(dto, principal.getMember());
        return new ResponseEntity<>("board save ok", HttpStatus.OK);
    }

    @PutMapping("/board")
    public ResponseEntity<String> boardEdit(@ModelAttribute BoardRequestDto dto, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board edit call");
        Long num = Long.parseLong(dto.getBoardId());
        dto.setId(num);
        boardService.edit(dto, principal.getMember());
        return new ResponseEntity<>("edit ok", HttpStatus.OK);
    }

    @DeleteMapping ("/board/{id}")
    public ResponseEntity<String> boardDelete(@PathVariable Long id, @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("board delete call");
        boardService.delete(id, principal);
        return new ResponseEntity<>("board delete ok", HttpStatus.OK);
    }

    @PostMapping("/reply")
    public ResponseEntity<String> replySave(ReplyRequestDto dto, @AuthenticationPrincipal PrincipalDetails principal) {
        log.info("reply save call");
        boardService.replySave(dto ,principal);
        return new ResponseEntity<>("reply save ok", HttpStatus.OK);
    }

    @DeleteMapping("/reply")
    public ResponseEntity<String> replyDelete(@RequestBody String id, @AuthenticationPrincipal PrincipalDetails principal) {
        log.info("reply delete call");
        Long numId = Long.parseLong(id);
        boardService.replyDelete(numId , principal);
        return new ResponseEntity<>("reply delete ok", HttpStatus.OK);
    }

    @PostMapping("/images/upload")
    public ResponseEntity<BoardImageResponseDto> imageUpload(@RequestParam(value = "image") MultipartFile file) throws IOException {
        log.info("image upload call");
        BoardImageResponseDto dto = boardService.boardImageSave(file);
        return new ResponseEntity<BoardImageResponseDto>(dto , HttpStatus.OK);
    }

    @GetMapping("/board/images")
    public ResponseEntity<String> imageDelete() {
        boardService.imageDeleteTest();
        return new ResponseEntity<String>("delete ok", HttpStatus.OK);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    @Controller
    public class failController {
        @GetMapping("/loginSuccess")
        public String loginSuccess() {
            return "forward:/OauthLoginSuccess.html";
        }
        @GetMapping("/loginFail")
        public String loginFail() {
            return "forward:/OauthLoginFail.html";
        }
    }
}
