import React, { useEffect, useState } from 'react';
import api from '../api';

const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);

  useEffect(() => {
    api.get('/concerts')
      .then(res => setConcerts(res.data))
      .catch(err => console.error(err));
  }, []);

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
