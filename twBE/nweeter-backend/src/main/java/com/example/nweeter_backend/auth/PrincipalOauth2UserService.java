package com.example.nweeter_backend.auth;

import com.example.nweeter_backend.auth.provider.GoogleUserInfo;
import com.example.nweeter_backend.auth.provider.KakaoUserInfo;
import com.example.nweeter_backend.auth.provider.OAuth2UserInfo;
import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.MemberRepository;
import com.example.nweeter_backend.service.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class PrincipalOauth2UserService extends DefaultOAuth2UserService {

    @Autowired
    public PrincipalOauth2UserService(MemberRepository memberRepository, MemberService memberService) {
        this.memberService = memberService;
        this.memberRepository = memberRepository;
    }

    private final MemberRepository memberRepository;
    private final MemberService memberService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        String provider = userRequest.getClientRegistration().getRegistrationId(); // google, kakao
        OAuth2User oAuth2User = super.loadUser(userRequest);
        System.out.println("getAttributes : "+super.loadUser(userRequest).getAttributes());
        OAuth2UserInfo oAuth2UserInfo = null;
        if(provider.equals("google")) {
            log.info("google login");
            oAuth2UserInfo = new GoogleUserInfo(oAuth2User.getAttributes());
        }else if(provider.equals("kakao")){
            log.info("kakao login");
            oAuth2UserInfo = new KakaoUserInfo(oAuth2User.getAttributes().get("id").toString(),
                    (Map)(oAuth2User.getAttributes().get("properties")),
                    (Map)(oAuth2User.getAttributes().get("kakao_account")));
        }else{
            log.info("Unsupported login.");
        }

        assert oAuth2UserInfo != null;
        Member member = memberService.oauthSave(oAuth2UserInfo);

        return new PrincipalDetails(member, oAuth2User.getAttributes());
    }
}
