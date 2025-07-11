package com.example.nweeter_backend.controller;

import com.example.nweeter_backend.auth.PrincipalDetails;
import com.example.nweeter_backend.dto.MemberInfoResponseDto;
import com.example.nweeter_backend.dto.MemberSignInRequestDto;
import com.example.nweeter_backend.service.MemberService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
public class MemberApiController {

    private final MemberService memberService;

    @Autowired
    public MemberApiController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/user/check")
    public ResponseEntity<Long> loginCheck(@AuthenticationPrincipal PrincipalDetails principalDetails) {
        log.info("log in check call ");
        return new ResponseEntity<>(principalDetails.getMember().getId() , HttpStatus.OK);
    }

    @PostMapping("/user/signUp")
    public ResponseEntity<String> signUp(@RequestBody MemberSignInRequestDto member) throws IOException {
        log.info("sign in call");
        memberService.save(member);
        return new ResponseEntity<>("save ok", HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<MemberInfoResponseDto> userInfo(@AuthenticationPrincipal PrincipalDetails principal){
        log.info("user info call");
        Long userId = principal.getMember().getId();
        MemberInfoResponseDto memberInfo = memberService.getInfo(userId);
        return new ResponseEntity<>(memberInfo, HttpStatus.OK);
    }

    @PatchMapping("/user")
    public ResponseEntity<String> userInfoEdit(@RequestParam(value = "file", required = false) MultipartFile file,
                             @RequestParam(value = "username", required = false) String username,
                             @AuthenticationPrincipal PrincipalDetails principal) throws IOException {
        log.info("user patch call");
        if(file != null) {
            log.info("user patch file");
            memberService.patchMember(file, principal);
        }
        if(username != null) {
            log.info("user patch username");
            memberService.patchMember(username, principal);
        }
        return new ResponseEntity<>("member patch ok", HttpStatus.OK);
    }

    @PatchMapping("/user/password")
    public ResponseEntity<String> userPasswordEdit(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal PrincipalDetails principal) {
        log.info("user password edit call");
        String password = (String)payload.get("password");
        System.out.println(password);
        memberService.patchPassword(password, principal);
        return new ResponseEntity<>("password edit ok", HttpStatus.OK);
    }

    @DeleteMapping("/user")
    public ResponseEntity<String> userDelete(@AuthenticationPrincipal PrincipalDetails principal) {
        log.info("user delete call");
        memberService.deleteMember(principal);
        return new ResponseEntity<>("sign out ok", HttpStatus.OK);
    }

    @GetMapping("/csrf-token")
    public CsrfToken csrf(CsrfToken token) {
        log.info("csrf-token call");
        return token;
    }
}
