package com.enterprise.itsm.auth.dto;

public record AuthResponse(
    String token,
    String email,
    String fullName,
    String role
) {}
