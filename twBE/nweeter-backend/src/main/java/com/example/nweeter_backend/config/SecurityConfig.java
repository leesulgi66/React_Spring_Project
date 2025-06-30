package com.example.nweeter_backend.config;

import com.example.nweeter_backend.auth.PrincipalOauth2UserService;
import com.example.nweeter_backend.handler.CustomAuthenticationFailureHandler;
import com.example.nweeter_backend.handler.CustomAuthenticationSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    final private CustomAuthenticationSuccessHandler authenticationSuccessHandler;
    final private CustomAuthenticationFailureHandler customAuthenticationFailureHandler;
    final private PrincipalOauth2UserService principalOauth2UserService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
                //.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers(
                                "/api/user/signUp",
                                "/api/csrf-token",
                                "/api/board",
                                "/loginFail",
                                "/loginSuccess",
                                "/OauthLoginFail.html",
                                "/OauthLoginSuccess.html").permitAll()
                        .anyRequest().authenticated()
                )
                //.httpBasic(Customizer.withDefaults())
        ;

        http
                .formLogin((config) -> config
                        .loginProcessingUrl("/loginApi")
                        .usernameParameter("email")
                        .successHandler(authenticationSuccessHandler)
                        .failureHandler(customAuthenticationFailureHandler)
                        .permitAll()
                )
                .oauth2Login(oauth ->  oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(principalOauth2UserService))
                        .defaultSuccessUrl("/loginSuccess")
                        .failureUrl("/loginFail")
                        .permitAll()
                )
        ;
        http
                .logout((config) -> config
                        .logoutUrl("/logout")
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication)->{
                            response.setStatus(HttpServletResponse.SC_OK);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"result\": \"logout ok\"}");
                        })
                        .permitAll()
                )
        ;
        http // loginPage disable
                .exceptionHandling(exceptionHandleConfig -> exceptionHandleConfig
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

        ;

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        // h2-console allow
        return (web)-> web.ignoring()
                .requestMatchers(PathRequest.toH2Console())
                .requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("X-CSRF-TOKEN"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
