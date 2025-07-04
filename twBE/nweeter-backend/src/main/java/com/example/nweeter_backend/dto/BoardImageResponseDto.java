package com.example.nweeter_backend.dto;

import lombok.Data;

@Data
public class BoardImageResponseDto {
    private String imageUrl;
    private String imageLocation;
    private Long imageId;
}
