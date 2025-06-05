package com.example.nweeter_backend.dto;

import lombok.Getter;

@Getter
public class MemberSignInRequestDto {
    private String username;
    private String password;
    private String email;
}
