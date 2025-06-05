package com.example.nweeter_backend.auth;

import com.example.nweeter_backend.modle.Member;
import com.example.nweeter_backend.repository.MemberRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PrincipalDetailsService implements UserDetailsService {

    private final MemberRepository memberRepository;

    public PrincipalDetailsService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("log in service call , email   : {}", email);
        Member principal = memberRepository.findByEmail(email).orElseThrow(()->{
            return new UsernameNotFoundException("해당 사용자를 찾을 수 없습니다. : " + email);
        });
        return new PrincipalDetails(principal);
    }
}
