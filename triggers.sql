-- Add attendance_count column to concert table
ALTER TABLE concert ADD COLUMN IF NOT EXISTS attendance_count INT DEFAULT 0;

-- Create function to increment attendance_count on ticket insert
CREATE OR REPLACE FUNCTION increment_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE concert
  SET attendance_count = attendance_count + 1
  WHERE concert_id = NEW.concert_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement attendance_count on ticket delete
CREATE OR REPLACE FUNCTION decrement_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE concert
  SET attendance_count = attendance_count - 1
  WHERE concert_id = OLD.concert_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on ticket AFTER INSERT to increment attendance_count
DROP TRIGGER IF EXISTS ticket_insert_trigger ON ticket;
CREATE TRIGGER ticket_insert_trigger
AFTER INSERT ON ticket
FOR EACH ROW
EXECUTE FUNCTION increment_attendance_count();

-- Create trigger on ticket AFTER DELETE to decrement attendance_count
DROP TRIGGER IF EXISTS ticket_delete_trigger ON ticket;
CREATE TRIGGER ticket_delete_trigger
AFTER DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION decrement_attendance_count();

-- Prevent double booking of the same seat for the same concert
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM ticket
    WHERE concert_id = NEW.concert_id AND seat_no = NEW.seat_no
  ) THEN
    RAISE EXCEPTION 'Seat % is already booked for concert %', NEW.seat_no, NEW.concert_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_double_booking_trigger ON ticket;
CREATE TRIGGER prevent_double_booking_trigger
BEFORE INSERT OR UPDATE ON ticket
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();

-- Create sales_summary table to track total revenue and tickets sold
CREATE TABLE IF NOT EXISTS sales_summary (
  id SERIAL PRIMARY KEY,
  total_revenue DECIMAL DEFAULT 0,
  total_tickets INT DEFAULT 0
);

-- Initialize sales_summary with one row if empty
INSERT INTO sales_summary (total_revenue, total_tickets)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM sales_summary);

-- Function to update sales_summary on payment insert
CREATE OR REPLACE FUNCTION update_sales_summary_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE sales_summary
  SET total_revenue = total_revenue + NEW.amount,
      total_tickets = total_tickets + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_insert_trigger ON payment;
CREATE TRIGGER payment_insert_trigger
AFTER INSERT ON payment
FOR EACH ROW
EXECUTE FUNCTION update_sales_summary_on_payment();
