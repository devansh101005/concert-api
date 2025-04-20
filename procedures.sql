-- Procedure to book a ticket for a concert
CREATE OR REPLACE PROCEDURE book_ticket(
    p_concert_id INT,
    p_buyer_first_name VARCHAR,
    p_buyer_last_name VARCHAR,
    p_buyer_email VARCHAR,
    p_buyer_phone VARCHAR,
    p_price DECIMAL,
    p_seat_no VARCHAR,
    p_payment_method VARCHAR,
    OUT p_ticket_id INT,
    OUT p_status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_id INT;
    v_buyer_id INT;
    v_seat_taken INT;
BEGIN
    -- Check if seat is already taken for the concert
    SELECT COUNT(*) INTO v_seat_taken
    FROM ticket
    WHERE concert_id = p_concert_id AND seat_no = p_seat_no;

    IF v_seat_taken > 0 THEN
        p_status := 'Seat already taken';
        p_ticket_id := NULL;
        RETURN;
    END IF;

    -- Insert payment record
    INSERT INTO payment (payment_date, amount, payment_method)
    VALUES (CURRENT_DATE, p_price, p_payment_method)
    RETURNING payment_id INTO v_payment_id;

    -- Insert buyer record
    INSERT INTO buyer (first_name, last_name, email_id, phone_no, password, payment_id)
    VALUES (p_buyer_first_name, p_buyer_last_name, p_buyer_email, p_buyer_phone, 'defaultpassword', v_payment_id)
    RETURNING buyer_id INTO v_buyer_id;

    -- Insert ticket record
    INSERT INTO ticket (price, seat_no, concert_id, buyer_id, payment_id)
    VALUES (p_price, p_seat_no, p_concert_id, v_buyer_id, v_payment_id)
    RETURNING ticket_id INTO p_ticket_id;

    p_status := 'Success';
END;
$$;

-- Procedure to add a new concert
CREATE OR REPLACE PROCEDURE add_concert(
    p_name VARCHAR,
    p_date DATE,
    p_time TIME,
    p_venue_id INT,
    p_organizer_id INT,
    p_spons_id INT,
    OUT p_concert_id INT,
    OUT p_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO concert (name, date, time, venue_id, organizer_id, spons_id)
    VALUES (p_name, p_date, p_time, p_venue_id, p_organizer_id, p_spons_id)
    RETURNING concert_id INTO p_concert_id;

    p_status := 'Success';
EXCEPTION WHEN OTHERS THEN
    p_status := SQLERRM;
    p_concert_id := NULL;
END;
$$;

-- Procedure to cancel a ticket
CREATE OR REPLACE PROCEDURE cancel_ticket(
    p_ticket_id INT,
    OUT p_status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM ticket WHERE ticket_id = p_ticket_id;
    p_status := 'Success';
EXCEPTION WHEN OTHERS THEN
    p_status := SQLERRM;
END;
$$;

-- Procedure to get concert details with performers and venue
CREATE OR REPLACE FUNCTION get_concert_details(
    p_concert_id INT
)
RETURNS TABLE (
    concert_id INT,
    name VARCHAR,
    date DATE,
    time TIME,
    venue_name VARCHAR,
    venue_city VARCHAR,
    artist_id INT,
    artist_first_name VARCHAR,
    artist_last_name VARCHAR,
    artist_genre VARCHAR,
    performance_time TIME
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.concert_id, c.name, c.date, c.time,
           v.name, v.city,
           a.artist_id, a.first_name, a.last_name, a.genre, p.performance_time
    FROM concert c
    JOIN venue v ON c.venue_id = v.venue_id
    LEFT JOIN performs p ON c.concert_id = p.concert_id
    LEFT JOIN artist a ON p.artist_id = a.artist_id
    WHERE c.concert_id = p_concert_id;
END;
$$;

-- Procedure to get ticket sales summary for a concert
CREATE OR REPLACE FUNCTION get_ticket_sales_summary(
    p_concert_id INT
)
RETURNS TABLE (
    total_tickets INT,
    total_revenue DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*) AS total_tickets, COALESCE(SUM(price), 0) AS total_revenue
    FROM ticket
    WHERE concert_id = p_concert_id;
END;
$$;
