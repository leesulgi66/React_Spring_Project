package com.example.nweeter_backend.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

@Component
public class ImageHandler {
    public String save(MultipartFile image, String key) throws IOException {
        String fileExtension = "."+Objects.requireNonNull(image.getOriginalFilename()).split("\\.")[1];
        //String uri = "http://localhost:8080/image/" + key ;
        String uploadDirectory = "D:\\images\\";

        try{
            // 폴더 없으면 생성
            File images = new File(uploadDirectory);
            if (!images.exists()) {
                images.mkdirs();
            }
            image.transferTo(new File(uploadDirectory, key+fileExtension));
        }catch(IOException e){
            System.out.println("error : " + e.getMessage());
        }

        return "/images/" + key+fileExtension;
    }

    public void deleteFile(String filePath){
        try{
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        }catch (IOException e){
            System.out.println("file delete fail : " + e.getMessage());
        }
    }
}
