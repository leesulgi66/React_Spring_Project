package com.example.nweeter_backend.service;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.dto.MemberInfoResponseDto;
import com.example.nweeter_backend.dto.MemberSignInRequestDto;
import com.example.nweeter_backend.handler.ImageHandler;
import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.BoardRepository;
import com.example.nweeter_backend.repository.MemberRepository;
import com.example.nweeter_backend.repository.ReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final BoardRepository boardRepository;
    private final ReplyRepository replyRepository;
    private final ImageHandler imageHandler;
    private final BCryptPasswordEncoder passwordEncoder;

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
        if(member.getProfileImage() != null){
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
        Member member = principal.getMember();
        replyRepository.deleteByMember(member);
        int boards = boardRepository.boards(member.getId());
        System.out.println("delete boards count : " + boards);
        memberRepository.delete(member);
    }
}
