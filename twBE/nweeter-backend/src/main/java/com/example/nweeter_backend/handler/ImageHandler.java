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

@Component
public class ImageHandler {
    public List<String> save(MultipartFile image, String key) throws IOException {
        String fileExtension = Objects.requireNonNull(image.getOriginalFilename()).split("\\.")[1];
        String uri = "http://localhost:8080/image/" + key+ "."+fileExtension;
        String fullPathName = "C:\\Users\\leesu\\Desktop\\twier clone\\twBE\\nweeter-backend\\src\\main\\resources\\static\\image\\" + key +"."+fileExtension;
        image.transferTo(new File(fullPathName));
        List<String> list = new ArrayList<>();
        list.add(0, fullPathName);
        list.add(1, uri);
        return list;
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
