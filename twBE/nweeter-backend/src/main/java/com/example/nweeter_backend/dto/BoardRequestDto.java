package com.example.nweeter_backend.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.io.Serializable;

@Setter
@Getter
public class BoardRequestDto implements Serializable {
    private String boardId;
    private Long Id;
    private String user;
    private String tweet;
}
