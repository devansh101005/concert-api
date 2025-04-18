-- Before running this script, we'll delete existing data to avoid conflicts
-- Delete from tables in reverse order of dependencies

-- Delete from dependent tables first
DELETE FROM STAFF;
DELETE FROM TICKET;
DELETE FROM BUYER;
DELETE FROM PAYMENT;
DELETE FROM PERFORMS;
DELETE FROM CONCERT_LOCATION;
DELETE FROM CONCERT;
DELETE FROM SPONSORSHIP;
DELETE FROM ORGANIZER;
DELETE FROM VENUE;
DELETE FROM ARTIST;

-- 1. ARTIST 
INSERT INTO ARTIST VALUES 
(1, 'Amit', 'Trivedi', 'Fusion', 'amit@example.com'), 
(2, 'Shreya', 'Ghoshal', 'Classical', 'shreya@example.com'), 
(3, 'Arijit', 'Singh', 'Romantic', 'arijit@example.com');  

-- 2. VENUE 
INSERT INTO VENUE VALUES 
(1, 'Wankhede Stadium', 'Marine Drive', 'Mumbai', 400020, 33000), 
(2, 'Sardar Patel Stadium', 'Motera', 'Ahmedabad', 382424, 110000), 
(3, 'Jawaharlal Nehru Stadium', 'Lodhi Road', 'Delhi', 110003, 60000);  

-- 3. ORGANIZER 
INSERT INTO ORGANIZER VALUES 
(1, 'Rahul', 'Verma', 'rahul.verma@example.com'), 
(2, 'Sneha', 'Patel', 'sneha.patel@example.com'), 
(3, 'Karan', 'Mehra', 'karan.mehra@example.com');  

-- 4. SPONSORSHIP 
INSERT INTO SPONSORSHIP VALUES 
(1, 'Coca-Cola', 500000), 
(2, 'Pepsi', 300000), 
(3, 'Red Bull', 400000);  

-- 5. CONCERT 
INSERT INTO CONCERT VALUES 
(1, 'Fusion Fiesta', '2025-05-01', '18:00:00', 1, 1, 1), 
(2, 'Classical Nights', '2025-05-10', '19:00:00', 2, 2, 2), 
(3, 'Romantic Melodies', '2025-05-15', '20:00:00', 3, 3, 3);  

-- 6. CONCERT_LOCATION 
INSERT INTO CONCERT_LOCATION VALUES 
(1, 'Mumbai'), 
(2, 'Ahmedabad'), 
(3, 'Delhi');  

-- 7. PERFORMS - Fixed data type error for performance_id
INSERT INTO PERFORMS (Artist_ID, Concert_ID, Performance_ID, Performance_Time) VALUES 
(1, 1, 101, '18:30:00'),
(2, 2, 102, '19:15:00'),
(3, 3, 103, '20:45:00');
-- 8. PAYMENT 
INSERT INTO PAYMENT VALUES 
(1, '2025-04-01', 2500, 'Credit Card'), 
(2, '2025-04-02', 1800, 'UPI'), 
(3, '2025-04-03', 3200, 'Debit Card');  

-- 9. BUYER 
INSERT INTO BUYER VALUES 
(1, 'Anjali', 'Sharma', 'anjali@example.com', '9876543210', 'pass123', 1), 
(2, 'Ravi', 'Kumar', 'ravi@example.com', '9123456789', 'pass456', 2), 
(3, 'Pooja', 'Rao', 'pooja@example.com', '9988776655', 'pass789', 3);  

-- 10. TICKET - Note: The schema defines Ticket_ID as the primary key but your insert uses composite key
INSERT INTO TICKET VALUES 
(1, 2500.00, 'A10', 1, 1, 1), 
(2, 1800.00, 'B15', 2, 2, 2), 
(3, 3200.00, 'C20', 3, 3, 3);  

-- 11. STAFF 
INSERT INTO STAFF VALUES 
(1, 'Manoj Tiwari', 'Security', 'manoj.tiwari@example.com', 1), 
(2, 'Neha Singh', 'Technician', 'neha.singh@example.com', 2), 
(3, 'Rajeev Yadav', 'Manager', 'rajeev.yadav@example.com', 3);