package com.example.nweeter_backend.service;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.auth.provider.OAuth2UserInfo;
import com.example.nweeter_backend.dto.MemberInfoResponseDto;
import com.example.nweeter_backend.dto.MemberSignInRequestDto;
import com.example.nweeter_backend.handler.ImageHandler;
import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.BoardRepository;
import com.example.nweeter_backend.repository.MemberRepository;
import com.example.nweeter_backend.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MemberService {
    final private MemberRepository memberRepository;
    final private BoardRepository boardRepository;
    final private ReplyRepository replyRepository;
    final private ImageHandler imageHandler;
    final private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public void save(MemberSignInRequestDto member) throws IOException {
        Optional<Member> foundName = memberRepository.findByUsername(member.getUsername());
        if(foundName.isPresent()) {
            throw new IOException("사용된 이름 입니다.");
        }
        Optional<Member> foundEmail = memberRepository.findByEmail(member.getEmail());
        if(foundEmail.isPresent()) {
            throw new IOException("사용된 email 입니다.");
        }
        Member saveMember = new Member();
        String password = member.getPassword();
        String encPassword = passwordEncoder.encode(password);
        saveMember.setUsername(member.getUsername());
        saveMember.setPassword(encPassword);
        saveMember.setEmail(member.getEmail());
        memberRepository.save(saveMember);
    }

    @Transactional
    public Member oauthSave(OAuth2UserInfo oAuth2UserInfo) throws OAuth2AuthenticationException {
        Random rand = new Random();
        int randomNumber = rand.nextInt(900) + 100;
        String provider = oAuth2UserInfo.getProvider();
        String providerId = oAuth2UserInfo.getProvider()+oAuth2UserInfo.getProviderId();
        String username = provider+"_"+oAuth2UserInfo.getName()+"_"+randomNumber;
        String password = passwordEncoder.encode(providerId);
        String email = oAuth2UserInfo.getEmail();
        String profileImg = oAuth2UserInfo.getProfileImage();

        Optional<Member> member = memberRepository.findByProviderId(providerId);

        try{
            if(!memberRepository.existsByEmail(email) && member.isEmpty()){
                Member saveMember = new Member();
                saveMember.setProvider(provider);
                saveMember.setProviderId(providerId);
                saveMember.setUsername(username);
                saveMember.setPassword(password);
                saveMember.setEmail(email);
                saveMember.setProfileImage(profileImg);
                memberRepository.save(saveMember);
                System.out.println("board oauth save ok");
                return saveMember;
            }else{
                return member.get();
            }
        }catch (Exception e) {
            throw new OAuth2AuthenticationException("사용할 수 없는 email 입니다.");
        }
    }

    @Transactional(readOnly = true)
    public MemberInfoResponseDto getInfo(Long id) throws IllegalArgumentException{
        Member member = memberRepository.findById(id).orElseThrow(()->
                new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));
        return new MemberInfoResponseDto(member);
    }

    @Transactional
    public void patchMember(MultipartFile file, PrincipalDetails principal) throws IOException {
        Member member = memberRepository.findById(principal.getMember().getId()).orElseThrow(
                ()-> new IllegalArgumentException("can not find user"));
        if(member.getProfileImageKey() != null){
            imageHandler.deleteFile(member.getProfileImageKey());
        }
        List<String> imgList = imageHandler.save(file, "userImg-"+principal.getMember().getId());
        if(member.getId().equals(principal.getMember().getId())){
            member.setProfileImage(imgList.get(0));
            member.setProfileImageKey(imgList.get(1));
        }
    }

    @Transactional
    public void patchMember(String username, PrincipalDetails principal) {
        Member member = memberRepository.findById(principal.getMember().getId()).orElseThrow(
                ()-> new IllegalArgumentException("can not find user"));
        if(Objects.equals(member.getId(), principal.getMember().getId())) {
            member.setUsername(username);
        }
    }

    @Transactional
    public void deleteMember(PrincipalDetails principal) {
        Member member = memberRepository.findById(principal.getMember().getId()).orElseThrow(
                ()-> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));
        replyRepository.deleteByMember(member);
        int boards = boardRepository.delBoards(member.getId());
        System.out.println("delete boards count : " + boards);
        if(!member.getProfileImageKey().isEmpty()){
            imageHandler.deleteFile(member.getProfileImageKey());
        }
        memberRepository.deleteById(member.getId());
    }
}
