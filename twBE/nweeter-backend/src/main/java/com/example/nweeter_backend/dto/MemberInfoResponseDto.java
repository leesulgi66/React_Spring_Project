package com.example.nweeter_backend.dto;

import com.example.nweeter_backend.modle.Member;
import lombok.Data;

@Data
public class MemberInfoResponseDto {
    public MemberInfoResponseDto(Member member) {
        this.id = member.getId();
        this.username = member.getUsername();
        this.email = member.getEmail();
        this.profileImage = member.getProfileImage();
        this.provider = member.getProvider();

    }
    private Long id;
    private String username;
    private String email;
    private String profileImage;
    private String provider;
}
