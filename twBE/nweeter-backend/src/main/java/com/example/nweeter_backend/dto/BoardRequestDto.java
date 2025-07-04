package com.example.nweeter_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.util.List;

@Setter
@Getter
public class BoardRequestDto implements Serializable {
    private String boardId;
    private Long Id;
    private String user;
    private String tweet;
    private List<String> imageIds;
}
