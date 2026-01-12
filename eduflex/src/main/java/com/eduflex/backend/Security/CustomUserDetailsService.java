package com.eduflex.backend.security;

import com.eduflex.backend.model.User;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Användare hittades inte: " + username));

        if (user.getRole() == null) {
            throw new UsernameNotFoundException("Användaren " + username + " saknar roll.");
        }

        List<GrantedAuthority> authorities;

        if (user.getRole().isSuperAdmin()) {
            // Super Admin gets a special role containing everything or generic wildcard if
            // supported
            // Here we just add ROLE_ADMIN and potentially all permissions if we list them
            // manually,
            // but for simplicity we assume downstream checks handle 'ROLE_ADMIN' as super.
            // OR better: we dynamically add all defined Permissions.
            authorities = new java.util.ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_SUPERADMIN"));
            // Add all permissions in the system for Super Admin
            for (com.eduflex.backend.model.Permission perm : com.eduflex.backend.model.Permission.values()) {
                authorities.add(new SimpleGrantedAuthority(perm.name()));
            }
        } else {
            // Normal users get their assigned permissions + Role Name
            authorities = new java.util.ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName())); // e.g. ROLE_TEACHER

            if (user.getRole().getPermissions() != null) {
                user.getRole().getPermissions().forEach(permission -> {
                    authorities.add(new SimpleGrantedAuthority(permission.name()));
                });
            }
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getIsActive(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities);
    }
}