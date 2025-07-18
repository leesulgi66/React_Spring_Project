package com.example.nweeter_backend.handler;

import com.example.nweeter_backend.auth.PrincipalDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authentication) throws IOException, ServletException {
        AuthenticationSuccessHandler.super.onAuthenticationSuccess(request, response, chain, authentication);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
        System.out.println("login success, csrfToken : "+csrfToken.getToken());
        PrincipalDetails principal = (PrincipalDetails) authentication.getPrincipal();
        response.setHeader("X-CSRF-TOKEN", csrfToken.getToken());
        response.setStatus(201);
        response.getWriter().write(principal.getMember().getId().toString());
    }
}
