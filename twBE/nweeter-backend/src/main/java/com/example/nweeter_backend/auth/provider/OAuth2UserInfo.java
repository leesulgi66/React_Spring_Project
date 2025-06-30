package com.example.nweeter_backend.auth.provider;

public interface OAuth2UserInfo {
    String getProviderId();
    String getProvider();
    String getName();
    String getNickname();
    String getEmail();
    String getProfileImage();
}
