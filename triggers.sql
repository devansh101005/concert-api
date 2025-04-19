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
