package com.cms.controller;

import com.cms.model.Complaint;
import com.cms.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService service;

    public ComplaintController(ComplaintService service) {
        this.service = service;
    }

    // ── GET all with pagination / filter / sort ──────────────
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(defaultValue = "")   String search,
            @RequestParam(defaultValue = "")   String status,
            @RequestParam(defaultValue = "")   String category,
            @RequestParam(defaultValue = "")   String priority,
            @RequestParam(defaultValue = "0")  int    page,
            @RequestParam(defaultValue = "10") int    size,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Page<Complaint> result = service.findAll(search, status, category, priority, page, size, sortBy, sortDir);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content",       result.getContent());
        response.put("page",          result.getNumber());
        response.put("size",          result.getSize());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages",    result.getTotalPages());
        response.put("last",          result.isLast());
        return ResponseEntity.ok(response);
    }

    // ── GET by ID ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // ── POST create ──────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Complaint> create(@Valid @RequestBody Complaint complaint) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(complaint));
    }

    // ── PUT update ───────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Complaint> update(
            @PathVariable Long id,
            @Valid @RequestBody Complaint complaint) {
        return ResponseEntity.ok(service.update(id, complaint));
    }

    // ── DELETE ───────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        service.delete(id);
        Map<String, String> resp = new LinkedHashMap<>();
        resp.put("message", "Complaint deleted successfully");
        return ResponseEntity.ok(resp);
    }
}
