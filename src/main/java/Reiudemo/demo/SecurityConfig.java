package Reiudemo.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Tắt CSRF để dễ test bằng Postman (không khuyến khích trong production)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/delete/**", "/edit/**", "/add/**").authenticated() // Các lệnh này cần đăng nhập
                .anyRequest().permitAll() // Còn lại (xem bảng, tìm kiếm) thì tự do
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .permitAll() // Đăng nhập xong thì về trang chủ
            )
            .logout(logout -> logout.logoutSuccessUrl("/")); // Thoát ra cũng về trang chủ
            
        return http.build();
    }
}
