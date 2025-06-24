package com.example.nweeter_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
public class ReplyResponseDto {
    private Long id;
    private Long boardId;
    private Long memberId;
    private LocalDateTime insertTime;
    private LocalDateTime updateTime;
    private String memberName;
    private String content;
}
