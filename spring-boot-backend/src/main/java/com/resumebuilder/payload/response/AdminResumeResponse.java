package com.resumebuilder.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminResumeResponse {
    private String id;
    private String name;
    private String userId;
    private String ownerUsername;
    private String template;
    private String updatedAt;
}
