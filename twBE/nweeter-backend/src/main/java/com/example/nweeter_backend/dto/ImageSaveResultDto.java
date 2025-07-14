package com.example.nweeter_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ImageSaveResultDto {
    private String originalImageUrl;
    private String originalFilePath;
    private String compressedImageUrl; // 압축 파일이 없을 경우 null
    private String compressedFilePath; // 압축 파일이 없을 경우 null
}
