import React, { useEffect, useState } from 'react';
import api from '../api';

const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get('/concerts')
      .then(res => setConcerts(res.data))
      .catch(() => setError('Failed to load concerts. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>Loading concerts...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (concerts.length === 0) {
    return <p>No upcoming concerts found.</p>;
  }

  return (
    <div>
      <h3>Upcoming Concerts</h3>
      <ul>
        {concerts.map(concert => (
          <li key={concert.id}>{concert.name} – {concert.date}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConcertList;
