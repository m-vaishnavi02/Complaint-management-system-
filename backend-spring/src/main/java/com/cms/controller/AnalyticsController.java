package com.cms.controller;

import com.cms.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ComplaintService service;

    public AnalyticsController(ComplaintService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(service.getSummary());
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<Map<String, Object>>> byStatus() {
        return ResponseEntity.ok(service.getByStatus());
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<Map<String, Object>>> byCategory() {
        return ResponseEntity.ok(service.getByCategory());
    }

    @GetMapping("/by-priority")
    public ResponseEntity<List<Map<String, Object>>> byPriority() {
        return ResponseEntity.ok(service.getByPriority());
    }

    @GetMapping("/resolution-by-category")
    public ResponseEntity<List<Map<String, Object>>> resolutionByCategory() {
        return ResponseEntity.ok(service.getResolutionByCategory());
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<Map<String, Object>>> monthlyTrend() {
        return ResponseEntity.ok(service.getMonthlyTrend());
    }
}
