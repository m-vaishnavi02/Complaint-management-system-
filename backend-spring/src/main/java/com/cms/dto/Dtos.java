package com.cms.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ── Complaint Request DTO ─────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ComplaintRequest {

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100)
    private String customerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Issue description is required")
    @Size(min = 10, message = "Issue must be at least 10 characters")
    private String issue;

    private String notes;
}

// ── Complaint Response DTO ────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ComplaintResponse {
    private Long id;
    private String complaintId;
    private String customerName;
    private String email;
    private String phone;
    private String category;
    private String priority;
    private String status;
    private String issue;
    private String notes;
    private LocalDate createdDate;
    private LocalDate updatedDate;
}

// ── Page Response ─────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class PagedResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
}

// ── Analytics DTOs ────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class AnalyticsSummary {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long highPriority;
    private int resolutionRate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class CategoryStat {
    private String category;
    private long total;
    private long resolved;
    private int resolutionRate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class MonthlyTrend {
    private int year;
    private int month;
    private String label;
    private long count;
}

// ── Error Response ────────────────────────────────────────────
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class ApiError {
    private int status;
    private String message;
    private Map<String, String> errors;
    private LocalDate timestamp;
}
