package com.cms.repository;

import com.cms.model.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // ── Paginated filtered search ─────────────────────────────
    @Query("""
        SELECT c FROM Complaint c
        WHERE (:search = '' OR
               LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.complaintId)  LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.issue)        LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(c.category)     LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status   = '' OR c.status   = :status)
          AND (:category = '' OR c.category = :category)
          AND (:priority = '' OR c.priority = :priority)
        """)
    Page<Complaint> findWithFilters(
        @Param("search")   String search,
        @Param("status")   String status,
        @Param("category") String category,
        @Param("priority") String priority,
        Pageable pageable
    );

    // ── Analytics ─────────────────────────────────────────────
    long countByStatus(String status);
    long countByPriority(String priority);

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countGroupByCategory();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c GROUP BY c.priority")
    List<Object[]> countGroupByPriority();

    @Query("SELECT c.category, COUNT(c), SUM(CASE WHEN c.status = 'Resolved' THEN 1 ELSE 0 END) FROM Complaint c GROUP BY c.category")
    List<Object[]> resolutionByCategory();

    @Query(value = """
        SELECT YEAR(created_date) AS yr, MONTH(created_date) AS mo, COUNT(*) AS cnt
        FROM complaints
        WHERE created_date >= DATE_SUB(CURDATE(), INTERVAL 8 MONTH)
        GROUP BY YEAR(created_date), MONTH(created_date)
        ORDER BY yr, mo
        """, nativeQuery = true)
    List<Object[]> monthlyTrend();

    @Query(value = "SELECT COALESCE(MAX(CAST(SUBSTRING(complaint_id, 5) AS UNSIGNED)), 0) FROM complaints", nativeQuery = true)
    Long findMaxComplaintNumber();
}
