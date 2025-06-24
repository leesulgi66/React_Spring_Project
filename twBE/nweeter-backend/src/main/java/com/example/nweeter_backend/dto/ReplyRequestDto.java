package com.example.nweeter_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReplyRequestDto {
    private Long boardId;
    private String content;
}
