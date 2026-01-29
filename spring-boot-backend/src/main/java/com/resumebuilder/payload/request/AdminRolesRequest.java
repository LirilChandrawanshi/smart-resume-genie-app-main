package com.resumebuilder.payload.request;

import lombok.Data;

import java.util.List;

@Data
public class AdminRolesRequest {
    private List<String> roles;
}
