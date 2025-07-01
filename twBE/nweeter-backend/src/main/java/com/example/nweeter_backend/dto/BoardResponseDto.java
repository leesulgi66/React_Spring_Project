package com.example.nweeter_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
public class BoardResponseDto {
    private Long boardId;
    private String tweet;
    private Long memberId;
    private LocalDateTime insertTime;
    private LocalDateTime updateTime;
    private String memberName;
    private String photo;
    private List<ReplyResponseDto> replies;
}
