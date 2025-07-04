package com.example.nweeter_backend.service;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.dto.*;
import com.example.nweeter_backend.handler.ImageHandler;
import com.example.nweeter_backend.modle.Board;
import com.example.nweeter_backend.modle.ImageInBoard;
import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.modle.Reply;
import com.example.nweeter_backend.repository.BoardRepository;
import com.example.nweeter_backend.repository.ImageInBoardRepository;
import com.example.nweeter_backend.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    final private BoardRepository boardRepository;
    final private ReplyRepository replyRepository;
    final private ImageInBoardRepository imageInBoardRepository;
    final private ImageHandler imageHandler;

    @Transactional
    public void save(BoardRequestDto dto, Member member) throws IOException {
        Board board = new Board();
        board.setMember(member);
        board.setTweet(dto.getTweet());
        boardRepository.save(board);
        //image file state change
        if(dto.getImageIds() != null){
            System.out.println(dto.getImageIds());
            for(String id : dto.getImageIds()) {
                Long num = Long.parseLong(id);
                ImageInBoard IIB = imageInBoardRepository.getReferenceById(num);
                IIB.setState(ImageInBoard.State.CONFIRMED);
                IIB.setBoardId(board.getId());
            }
        }
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
        board.setTweet(dto.getTweet());
        boardRepository.save(board);
        //image file state change
        if(dto.getImageIds() != null){
            System.out.println(dto.getImageIds());
            for(String id : dto.getImageIds()) {
                Long num = Long.parseLong(id);
                ImageInBoard IIB = imageInBoardRepository.getReferenceById(num);
                IIB.setState(ImageInBoard.State.CONFIRMED);
                IIB.setBoardId(board.getId());
            }
        }
        System.out.println("board update ok");
    }

    public void delete(Long id, PrincipalDetails principal) {
        Board board = boardRepository.getReferenceById(id);
        if(board.getMember().getId().equals(principal.getMember().getId())){
            List<ImageInBoard> list = imageInBoardRepository.findAllByBoardId(id);
            if(!list.isEmpty()){
                for(ImageInBoard image : list) {
                    imageHandler.deleteFile(image.getImageLocation());
                    imageInBoardRepository.delete(image);
                }
            }
            boardRepository.deleteById(id);
        }
    }

    @Transactional
    public void replySave(ReplyRequestDto dto, PrincipalDetails principal) {
        Board board = boardRepository.findById(dto.getBoardId()).orElseThrow(()-> new IllegalArgumentException("can't find board"));
        Member member = principal.getMember();
        Reply reply = new Reply();
        reply.setBoard(board);
        reply.setMember(member);
        reply.setContent(dto.getContent());
        replyRepository.save(reply);
    }

    @Transactional
    public void replyDelete(Long id, PrincipalDetails principal) {
        Reply reply = replyRepository.getReferenceById(id);
        if(reply.getMember().getId().equals(principal.getMember().getId())){
            replyRepository.deleteById(id);
        }
    }

    @Transactional
    public BoardImageResponseDto boardImageSave(MultipartFile file) throws IOException {
        BoardImageResponseDto dto = new BoardImageResponseDto();
        ImageInBoard IIB = new ImageInBoard();
        List<String> list = imageHandler.save(file, "boardImg");
        IIB.setImageUrl(list.get(0));
        IIB.setImageLocation(list.get(1));
        IIB.setState(ImageInBoard.State.PENDING);
        IIB = imageInBoardRepository.save(IIB);

        dto.setImageUrl(IIB.getImageUrl());
        dto.setImageLocation(IIB.getImageLocation());
        dto.setImageId(IIB.getId());

        return dto;
    }

    public void imageDeleteTest() {
        List<ImageInBoard> list = imageInBoardRepository.findAllByState(ImageInBoard.State.PENDING);
        for(ImageInBoard image : list) {
            String delLocation = image.getImageLocation();
            imageHandler.deleteFile(delLocation);
            imageInBoardRepository.delete(image);
        }
        System.out.println(list);
    }

    private Page<BoardResponseDto> boardResponseDto(Page<Board> boards) {
        return boards.map(p ->
                BoardResponseDto.builder()
                        .boardId(p.getId())
                        .tweet(p.getTweet())
                        .photo(p.getMember().getProfileImage())
                        .memberId(p.getMember().getId())
                        .memberName(p.getMember().getUsername())
                        .insertTime(p.getInsertTime())
                        .updateTime(p.getUpdateTime())
                        .replies(
                                p.getReplies().stream()
                                        .map(r -> ReplyResponseDto.builder()
                                                .id(r.getId())
                                                .boardId(r.getBoard().getId())
                                                .memberId(r.getMember().getId())
                                                .insertTime(r.getInsertTime())
                                                .updateTime(r.getUpdateTime())
                                                .memberName(r.getMember().getUsername())
                                                .content(r.getContent())
                                                .build()).collect(Collectors.toList())
                        )
                        .build());
    }
}
