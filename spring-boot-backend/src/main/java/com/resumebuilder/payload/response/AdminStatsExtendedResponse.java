package com.resumebuilder.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class AdminStatsExtendedResponse {
    private long totalUsers;
    private long totalResumes;
    private Map<String, Long> resumesByTemplate;
}
