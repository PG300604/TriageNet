package com.triagenet.service;

import com.triagenet.config.CustomUserDetails;
import com.triagenet.entity.StaffUser;
import com.triagenet.repository.StaffUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StaffUserRepository staffUserRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        StaffUser user = staffUserRepository.findByStaffIdOrEmail(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with Staff ID or email: " + identifier));
        return new CustomUserDetails(user);
    }
}
