package com.cms.service;

import com.cms.model.Complaint;
import com.cms.repository.ComplaintRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@Transactional
public class ComplaintService {

    private final ComplaintRepository repo;

    public ComplaintService(ComplaintRepository repo) {
        this.repo = repo;
    }

    // ── CRUD ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<Complaint> findAll(String search, String status, String category,
                                   String priority, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return repo.findWithFilters(
                search   == null ? "" : search.trim(),
                status   == null ? "" : status.trim(),
                category == null ? "" : category.trim(),
                priority == null ? "" : priority.trim(),
                pageable
        );
    }

    @Transactional(readOnly = true)
    public Complaint findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found with id: " + id));
    }

    public Complaint create(Complaint complaint) {
        complaint.setCreatedDate(LocalDate.now());
        complaint.setUpdatedDate(LocalDate.now());
        complaint.setComplaintId("TEMP");
        Complaint saved = repo.save(complaint);
        saved.setComplaintId(String.format("CMP-%03d", saved.getId()));
        return repo.save(saved);
    }

    public Complaint update(Long id, Complaint updated) {
        Complaint existing = findById(id);
        existing.setCustomerName(updated.getCustomerName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setCategory(updated.getCategory());
        existing.setPriority(updated.getPriority());
        existing.setStatus(updated.getStatus());
        existing.setIssue(updated.getIssue());
        existing.setNotes(updated.getNotes());
        existing.setUpdatedDate(LocalDate.now());
        return repo.save(existing);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Complaint not found with id: " + id);
        }
        repo.deleteById(id);
    }

    // ── Analytics ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary() {
        long total    = repo.count();
        long open     = repo.countByStatus("Open");
        long inProg   = repo.countByStatus("In Progress");
        long resolved = repo.countByStatus("Resolved");
        long closed   = repo.countByStatus("Closed");
        long high     = repo.countByPriority("High");
        int  rate     = total > 0 ? (int) Math.round((double) resolved / total * 100) : 0;

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("total",          total);
        map.put("open",           open);
        map.put("inProgress",     inProg);
        map.put("resolved",       resolved);
        map.put("closed",         closed);
        map.put("highPriority",   high);
        map.put("resolutionRate", rate);
        return map;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByStatus() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : repo.countGroupByStatus()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("status", row[0]);
            m.put("count",  row[1]);
            result.add(m);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByCategory() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : repo.countGroupByCategory()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category", row[0]);
            m.put("count",    row[1]);
            result.add(m);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getByPriority() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : repo.countGroupByPriority()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("priority", row[0]);
            m.put("count",    row[1]);
            result.add(m);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getResolutionByCategory() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : repo.resolutionByCategory()) {
            long total    = ((Number) row[1]).longValue();
            long resolved = ((Number) row[2]).longValue();
            int  rate     = total > 0 ? (int) Math.round((double) resolved / total * 100) : 0;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category",       row[0]);
            m.put("total",          total);
            m.put("resolved",       resolved);
            m.put("resolutionRate", rate);
            result.add(m);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlyTrend() {
        List<Map<String, Object>> result = new ArrayList<>();
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        for (Object[] row : repo.monthlyTrend()) {
            int year  = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("year",  year);
            m.put("month", month);
            m.put("label", months[month - 1] + " " + String.valueOf(year).substring(2));
            m.put("count", ((Number) row[2]).longValue());
            result.add(m);
        }
        return result;
    }
}
