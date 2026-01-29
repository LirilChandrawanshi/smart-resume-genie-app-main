package com.resumebuilder.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class AdminUserResponse {
    private String id;
    private String username;
    private String email;
    private Set<String> roles;
    private long resumeCount;
}
