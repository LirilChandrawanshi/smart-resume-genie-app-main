package com.resumebuilder.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AdminPageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int number;
}
