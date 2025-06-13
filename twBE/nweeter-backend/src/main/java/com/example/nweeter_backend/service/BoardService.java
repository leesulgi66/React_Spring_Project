package com.example.nweeter_backend.service;

import com.example.nweeter_backend.dto.BoardRequestDto;
import com.example.nweeter_backend.dto.BoardResponseDto;
import com.example.nweeter_backend.handler.ImageHandler;
import com.example.nweeter_backend.modle.Board;
import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BoardService {

    final private BoardRepository boardRepository;
    final private ImageHandler imageHandler;

    @Transactional
    public void save(BoardRequestDto dto, Member member) throws IOException {
        Board board = new Board();
        board.setMember(member);
        board.setTweet(dto.getTweet());
        boardRepository.save(board);
        System.out.println("board save ok");
    }

    @Transactional(readOnly = true)
    public Page<BoardResponseDto> getAllBoards(Pageable pageable) {
        Page<Board> boards = boardRepository.findAll(pageable);
        return boardResponseDto(boards);
    }

    @Transactional(readOnly = true)
    public Page<BoardResponseDto> getMemberBoards(Pageable pageable, Long id) {
        Page<Board> boards = boardRepository.boards(id, pageable);
        return boardResponseDto(boards);
    }

    @Transactional
    public void edit(BoardRequestDto dto, Member member) throws IOException {
        Board board = boardRepository.findById(dto.getId()).orElseThrow(()-> new IllegalArgumentException("can't find board"));
        if(!Objects.equals(board.getMember().getId(), member.getId())) {
            throw new IOException("not equal user");
        }
        board.setMember(member);
        board.setTweet(dto.getTweet());
        boardRepository.save(board);
        System.out.println("board update ok");
    }

    public void delete(Long id) {
        boardRepository.deleteById(id);
    }

    private Page<BoardResponseDto> boardResponseDto(Page<Board> boards) {
        return boards.map(p ->
                BoardResponseDto.builder()
                        .boardId(p.getId())
                        .tweet(p.getTweet())
                        .memberId(p.getMember().getId())
                        .memberName(p.getMember().getUsername())
                        .insertTime(p.getInsertTime())
                        .updateTime(p.getUpdateTime())
                        .build());
    }

}
