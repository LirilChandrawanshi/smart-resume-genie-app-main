
package com.resumebuilder.repository;

import com.resumebuilder.model.Resume;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ResumeRepository extends MongoRepository<Resume, String> {
    List<Resume> findByUserId(String userId);
    Page<Resume> findByUserId(String userId, Pageable pageable);
    void deleteByUserId(String userId);
}
