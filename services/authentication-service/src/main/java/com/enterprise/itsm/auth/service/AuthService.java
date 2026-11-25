package com.enterprise.itsm.auth.service;

import com.enterprise.itsm.auth.dto.*;
import com.enterprise.itsm.auth.entity.Employee;
import com.enterprise.itsm.auth.repository.EmployeeRepository;
import com.enterprise.itsm.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final EmployeeRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(EmployeeRepository repository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Email already registered");
        }

        Employee employee = new Employee();
        employee.setFullName(request.fullName());
        employee.setEmail(request.email().toLowerCase().trim());
        employee.setPassword(passwordEncoder.encode(request.password()));

        Employee saved = repository.save(employee);
        return createResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        Employee employee = repository.findByEmail(
            request.email().toLowerCase().trim()
        ).orElseThrow(() -> new ResponseStatusException(
            HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), employee.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return createResponse(employee);
    }

    private AuthResponse createResponse(Employee employee) {
        String token = jwtService.generateToken(
            employee.getEmail(), employee.getRole());

        return new AuthResponse(
            token, employee.getEmail(),
            employee.getFullName(), employee.getRole());
    }
}
