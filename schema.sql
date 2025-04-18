DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS ticket CASCADE;
DROP TABLE IF EXISTS buyer CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS performs CASCADE;
DROP TABLE IF EXISTS concert_location CASCADE;
DROP TABLE IF EXISTS concert CASCADE;
DROP TABLE IF EXISTS sponsorship CASCADE;
DROP TABLE IF EXISTS organizer CASCADE;
DROP TABLE IF EXISTS venue CASCADE;
DROP TABLE IF EXISTS artist CASCADE;

-- 1. ARTIST
CREATE TABLE artist (
  artist_id      INT PRIMARY KEY,
  first_name     VARCHAR(255) NOT NULL,
  last_name      VARCHAR(255) NOT NULL,
  genre          VARCHAR(255),
  contact_info   VARCHAR(255)
);

-- 2. VENUE
CREATE TABLE venue (
  venue_id   INT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  street     VARCHAR(255),
  city       VARCHAR(255),
  pin_code   INT UNIQUE,
  capacity   INT NOT NULL
);

-- 3. ORGANIZER
CREATE TABLE organizer (
  organizer_id INT PRIMARY KEY,
  first_name   VARCHAR(255) NOT NULL,
  last_name    VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) UNIQUE
);

-- 4. SPONSORSHIP
CREATE TABLE sponsorship (
  sponsor_id   INT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  spons_amount DECIMAL NOT NULL
);

-- 5. CONCERT
CREATE TABLE concert (
  concert_id   INT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  date         DATE    NOT NULL,
  time         TIME    NOT NULL,
  venue_id     INT,
  organizer_id INT,
  spons_id     INT,
  FOREIGN KEY (venue_id)     REFERENCES venue(venue_id),
  FOREIGN KEY (organizer_id) REFERENCES organizer(organizer_id),
  FOREIGN KEY (spons_id)     REFERENCES sponsorship(sponsor_id)
);

-- 6. CONCERT_LOCATION
CREATE TABLE concert_location (
  concert_id INT,
  location   VARCHAR(255),
  PRIMARY KEY (concert_id, location),
  FOREIGN KEY (concert_id) REFERENCES concert(concert_id)
);

-- 7. PERFORMS
CREATE TABLE performs (
  artist_id        INT,
  concert_id       INT,
  performance_id   INT,
  performance_time TIME,
  PRIMARY KEY (artist_id, concert_id, performance_id),
  FOREIGN KEY (artist_id) REFERENCES artist(artist_id),
  FOREIGN KEY (concert_id) REFERENCES concert(concert_id)
);

-- 8. PAYMENT
CREATE TABLE payment (
  payment_id     INT PRIMARY KEY,
  payment_date   DATE NOT NULL,
  amount         DECIMAL NOT NULL,
  payment_method VARCHAR(255)
);

-- 9. BUYER
CREATE TABLE buyer (
  buyer_id   INT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name  VARCHAR(255) NOT NULL,
  email_id   VARCHAR(255) UNIQUE,
  phone_no   VARCHAR(255) UNIQUE,
  password   VARCHAR(255) NOT NULL,
  payment_id INT,
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

-- 10. TICKET
CREATE TABLE ticket (
  ticket_id  INT PRIMARY KEY,
  price      DECIMAL(10,2) NOT NULL,
  seat_no    VARCHAR(50) NOT NULL,
  concert_id INT,
  buyer_id   INT,
  payment_id INT,
  FOREIGN KEY (concert_id) REFERENCES concert(concert_id),
  FOREIGN KEY (buyer_id)   REFERENCES buyer(buyer_id),
  FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
);

-- 11. STAFF
CREATE TABLE staff (
  staff_id     INT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  role         VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) UNIQUE,
  concert_id   INT,
  FOREIGN KEY (concert_id) REFERENCES concert(concert_id)
);
