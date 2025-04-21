-- Procedure to add or update sponsorship amount
CREATE OR REPLACE PROCEDURE add_or_update_sponsorship(
    p_sponsor_id INT,
    p_name VARCHAR,
    p_spons_amount DECIMAL,
    OUT p_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_sponsor_id IS NULL THEN
        INSERT INTO sponsorship (name, spons_amount)
        VALUES (p_name, p_spons_amount);
        p_status := 'Sponsorship added';
    ELSE
        UPDATE sponsorship
        SET name = p_name, spons_amount = p_spons_amount
        WHERE sponsor_id = p_sponsor_id;
        IF NOT FOUND THEN
            p_status := 'Sponsor ID not found';
        ELSE
            p_status := 'Sponsorship updated';
        END IF;
    END IF;
END;
$$;

-- Procedure to get total revenue by sponsor
CREATE OR REPLACE FUNCTION get_total_revenue_by_sponsor(
    p_sponsor_id INT
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    total_revenue DECIMAL;
BEGIN
    SELECT COALESCE(SUM(t.price), 0) INTO total_revenue
    FROM ticket t
    JOIN concert c ON t.concert_id = c.concert_id
    WHERE c.spons_id = p_sponsor_id;
    RETURN total_revenue;
END;
$$;

-- Procedure to assign staff to a concert
CREATE OR REPLACE PROCEDURE assign_staff_to_concert(
    p_staff_id INT,
    p_concert_id INT,
    OUT p_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE staff
    SET concert_id = p_concert_id
    WHERE staff_id = p_staff_id;
    IF NOT FOUND THEN
        p_status := 'Staff ID not found';
    ELSE
        p_status := 'Staff assigned to concert';
    END IF;
END;
$$;

-- Procedure to get all performances for a given artist
CREATE OR REPLACE FUNCTION get_performances_by_artist(
    p_artist_id INT
)
RETURNS TABLE (
    concert_id INT,
    performance_id INT,
    performance_time TIME
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT concert_id, performance_id, performance_time
    FROM performs
    WHERE artist_id = p_artist_id;
END;
$$;

-- Procedure to get all concerts at a specific venue
CREATE OR REPLACE FUNCTION get_concerts_by_venue(
    p_venue_id INT
)
RETURNS TABLE (
    concert_id INT,
    name VARCHAR,
    date DATE,
    time TIME
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT concert_id, name, date, time
    FROM concert
    WHERE venue_id = p_venue_id;
END;
$$;
