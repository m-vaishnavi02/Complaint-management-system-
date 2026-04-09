-- ============================================================
-- ComplaintDesk — MySQL Schema + Seed Data
-- Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS complaint_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE complaint_db;

-- Drop if re-running
DROP TABLE IF EXISTS complaints;

CREATE TABLE complaints (
  id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
  complaint_id  VARCHAR(20)  UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  category      VARCHAR(50)  NOT NULL,
  priority      VARCHAR(20)  NOT NULL DEFAULT 'Medium',
  status        VARCHAR(30)  NOT NULL DEFAULT 'Open',
  issue         TEXT         NOT NULL,
  notes         TEXT,
  created_date  DATE         NOT NULL,
  updated_date  DATE         NOT NULL,
  INDEX idx_status       (status),
  INDEX idx_category     (category),
  INDEX idx_priority     (priority),
  INDEX idx_created_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed data ────────────────────────────────────────────────
INSERT INTO complaints
  (complaint_id, customer_name, email, phone, category, priority, status, issue, notes, created_date, updated_date)
VALUES
  ('CMP-001','Arjun Mehta','arjun@example.com','9876543210','Billing','High','Open','Charged twice for the same subscription in November.','Customer submitted bank statement.','2025-11-01','2025-11-02'),
  ('CMP-002','Priya Sharma','priya@example.com','9000123456','Technical','High','In Progress','Application crashes on login with Android 14.','Reproducible on multiple devices.','2025-11-03','2025-11-05'),
  ('CMP-003','Ravi Nair','ravi@example.com','8899001122','Delivery','Medium','Resolved','Package did not arrive within the promised 3-day window.','Refund issued on 10-Nov.','2025-11-04','2025-11-10'),
  ('CMP-004','Deepika Joshi','deepika@example.com','7700112233','Product','Low','Closed','Product color does not match website listing.','Customer accepted store credit.','2025-11-05','2025-11-08'),
  ('CMP-005','Kiran Reddy','kiran@example.com','9955667788','Account','High','Open','Unable to reset password — OTP not received.','Escalated to auth team.','2025-11-06','2025-11-06'),
  ('CMP-006','Sunita Rao','sunita@example.com','8811223344','Billing','Medium','In Progress','Refund not processed after 14 business days.','Payment gateway ticket raised.','2025-11-07','2025-11-09'),
  ('CMP-007','Amir Khan','amir@example.com','9944556677','Technical','Low','Resolved','Push notifications not working on iOS 17.','Fixed in build 4.1.2.','2025-11-08','2025-11-12'),
  ('CMP-008','Lakshmi Venkat','lakshmi@example.com','8800990011','Delivery','High','Open','Wrong item delivered — received a keyboard instead of mouse.','Pickup scheduled.','2025-11-09','2025-11-09'),
  ('CMP-009','Rohit Gupta','rohit@example.com','7766554433','Other','Low','Closed','Feedback on website UX — checkout flow confusing.','Forwarded to product team.','2025-11-10','2025-11-11'),
  ('CMP-010','Meera Pillai','meera@example.com','9933221100','Account','Medium','In Progress','Account locked after failed login attempts.','Identity verification in process.','2025-11-11','2025-11-13'),
  ('CMP-011','Vijay Kumar','vijay@example.com','8822334455','Billing','High','Open','Invoice shows incorrect GST amount.','Sent to finance for correction.','2025-11-12','2025-11-12'),
  ('CMP-012','Asha Bhat','asha@example.com','9911223300','Product','Medium','Resolved','Defective charger received — unit overheating.','Replacement dispatched.','2025-11-13','2025-11-15'),
  ('CMP-013','Suresh Nambiar','suresh@example.com','7788990011','Technical','High','Open','Data sync failing between mobile and web platform.','Backend logs being investigated.','2025-11-14','2025-11-14'),
  ('CMP-014','Kavitha Menon','kavitha@example.com','8877665544','Delivery','Low','Closed','Packaging damaged in transit though product intact.','Feedback noted for logistics.','2025-11-15','2025-11-16'),
  ('CMP-015','Rajan Pillai','rajan@example.com','9966778899','Other','Medium','In Progress','Customer service rep was rude on call.','HR review initiated.','2025-11-16','2025-11-17');
