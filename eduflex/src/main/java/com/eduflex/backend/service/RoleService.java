package com.eduflex.backend.service;

import com.eduflex.backend.dto.RoleRequest;
import com.eduflex.backend.model.Permission;
import com.eduflex.backend.model.Role;
import com.eduflex.backend.repository.RoleRepository;
import com.eduflex.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<String> getAllPermissions() {
        return Arrays.stream(Permission.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
    }

    @Transactional
    public Role createRole(RoleRequest request) {
        if (roleRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Role with name " + request.getName() + " already exists.");
        }

        Role role = new Role();
        role.setName(request.getName().toUpperCase());
        role.setDescription(request.getDescription());
        role.setSuperAdmin(request.isSuperAdmin());

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissions() != null) {
            for (String permName : request.getPermissions()) {
                try {
                    permissions.add(Permission.valueOf(permName));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid permissions or log warning
                }
            }
        }
        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    @Transactional
    public Role updateRole(Long id, RoleRequest request) {
        Role role = getRoleById(id);

        // Prevent modifying system roles names maybe? For now allow it, but safeguard
        // uniqueness
        if (!role.getName().equalsIgnoreCase(request.getName())
                && roleRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("Role with name " + request.getName() + " already exists.");
        }

        // Don't allow renaming ADMIN to something else if it breaks things, but let's
        // trust the admin.
        if (role.getName().equals("ADMIN") && !request.getName().equals("ADMIN")) {
            throw new RuntimeException("Cannot rename system role ADMIN.");
        }

        role.setName(request.getName().toUpperCase());
        role.setDescription(request.getDescription());
        role.setSuperAdmin(request.isSuperAdmin());

        Set<Permission> permissions = new HashSet<>();
        if (request.getPermissions() != null) {
            for (String permName : request.getPermissions()) {
                try {
                    permissions.add(Permission.valueOf(permName));
                } catch (IllegalArgumentException e) {
                    // Ignore
                }
            }
        }
        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(Long id) {
        Role role = getRoleById(id);

        if (role.getName().equals("ADMIN") || role.getName().equals("TEACHER") || role.getName().equals("STUDENT")) {
            throw new RuntimeException("Cannot delete system roles (ADMIN, TEACHER, STUDENT).");
        }

        long userCount = userRepository.countByRole(role);
        if (userCount > 0) {
            throw new RuntimeException(
                    "Cannot delete role " + role.getName() + " because it is assigned to " + userCount + " users.");
        }

        roleRepository.delete(role);
    }
}
