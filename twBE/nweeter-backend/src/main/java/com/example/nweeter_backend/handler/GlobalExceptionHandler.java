package com.example.nweeter_backend.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

@ControllerAdvice
@RestController
public class GlobalExceptionHandler {

    @ExceptionHandler(value=Exception.class)
    public ResponseEntity<String> handlerArgumentException(Exception e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatusCode.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()));
    }
}
