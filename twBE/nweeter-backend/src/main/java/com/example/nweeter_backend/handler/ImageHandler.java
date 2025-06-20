package com.example.nweeter_backend.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Component
public class ImageHandler {
    public List<String> save(MultipartFile image, String key) throws IOException {
        String fileExtension = "."+Objects.requireNonNull(image.getOriginalFilename()).split("\\.")[1];
        String baseUrl = "http://127.0.0.1:8080";
        String uploadDirectory = "D:\\images\\";
        List<String> list = new ArrayList<>();
        UUID uuid = UUID.randomUUID();
        try{
            // 폴더 없으면 생성
            File images = new File(uploadDirectory);
            if (!images.exists()) {
                images.mkdirs();
            }
            image.transferTo(new File(uploadDirectory, key+uuid+fileExtension));
        }catch(IOException e){
            System.out.println("error : " + e.getMessage());
        }

        String imgUrl = baseUrl+"/images/"+key+uuid+fileExtension;
        String delLocation = uploadDirectory+key+uuid+fileExtension;

        list.add(0, imgUrl);
        list.add(delLocation);

        return list;
    }

    public void deleteFile(String filePath){
        try{
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            System.out.println("delete Image");
        }catch (IOException e){
            System.out.println("file delete fail : " + e.getMessage());
        }
    }
}
