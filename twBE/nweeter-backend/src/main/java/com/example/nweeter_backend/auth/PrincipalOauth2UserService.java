package com.example.nweeter_backend.auth;

import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.MemberRepository;
import com.example.nweeter_backend.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
        System.out.println("getAttributes : "+super.loadUser(userRequest).getAttributes());

        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getClientName();
        Optional<Member> memberEntity = memberRepository.findByEmail(oAuth2User.getAttribute("email"));

        if(memberEntity.isEmpty()) {
            memberEntity =  memberService.googleSave(oAuth2User, provider);
        }

        return new PrincipalDetails(memberEntity.get(), oAuth2User.getAttributes());
    }
}
