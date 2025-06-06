package com.example.nweeter_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfigure implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/image/**")
                .addResourceLocations("file:C:\\Users\\leesu\\Desktop\\react_spring\\react-spring\\React_Spring_Project\\twBE\\nweeter-backend\\src\\main\\resources\\static\\image\\");
    }
}
