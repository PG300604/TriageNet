package com.triagenet.config;

import com.triagenet.entity.StaffUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID id;
    private final String name;
    private final String email;
    private final String staffId;
    private final StaffUser.UserStatus status;
    private final String password;
    private final UUID hospitalId;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(StaffUser user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.staffId = user.getStaffId();
        this.status = user.getStatus();
        this.password = user.getPasswordHash();
        this.hospitalId = user.getHospitalId();
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().getName().name())
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
