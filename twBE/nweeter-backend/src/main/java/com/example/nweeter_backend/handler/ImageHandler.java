package com.example.nweeter_backend.handler;

import com.example.nweeter_backend.dto.ImageSaveResultDto;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;
import java.util.UUID;

@Component
public class ImageHandler {
    @Value("${file.upload-dir}")
    private String uploadDirectory;
    @Value("${file.upload-uri}")
    private String baseUrl;

    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final String COMPRESSED_SUFFIX = "_compressed";

    public ImageSaveResultDto save(MultipartFile image, String key) throws IOException {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어있습니다.");
        }

        String extension = "." + StringUtils.getFilenameExtension(image.getOriginalFilename()); // 확장자 추출
        String uuid = UUID.randomUUID().toString();

        String originalFilename = key + uuid + extension;
        File originalFile = new File(uploadDirectory, originalFilename); // 원본 파일

        // 폴더 생성
        File dir = new File(uploadDirectory);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        ImageSaveResultDto imgDto = null;
        try {
            image.transferTo(originalFile);
            imgDto = new ImageSaveResultDto();
            imgDto.setOriginalImageUrl(baseUrl + "/images/" + originalFilename); // 원본 이미지 url
            imgDto.setOriginalFilePath(originalFile.getAbsolutePath()); // 원본 이미지 location
        } catch (IOException e) {
            System.out.println("error : " + e.getMessage());
        }

        if (image.getSize() > MAX_FILE_SIZE) { // 사진 용량이 2MB 이상일 시 압축
            String compressedFilename = key + uuid + COMPRESSED_SUFFIX + extension;
            File compressedFile = new File(uploadDirectory, compressedFilename);

            // Thumbnailator를 사용한 이미지 압축 (화질 0.75로 설정)
            // 가로 세로 크기를 유지하면서 압축만 하려면 .size() 대신 .scale(1)을 사용합니다.
            Thumbnails.of(originalFile)
                    .scale(1) // 원본 크기 유지
                    .outputQuality(0.75) // JPG 화질 75%로 압축
                    .toFile(compressedFile);
            assert imgDto != null;
            imgDto.setCompressedImageUrl(baseUrl + "/images/" + compressedFilename);
            imgDto.setCompressedFilePath(compressedFile.getAbsolutePath());
        }

        return imgDto;
    }

    public void deleteFile(String filePath){
        if (filePath == null || filePath.isEmpty()) {
            return;
        }
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            System.out.println("Deleted Image: " + filePath);
        } catch (IOException e) {
            System.err.println("File delete failed: " + filePath + ", Error: " + e.getMessage());
        }
    }
}
