import React, { useState } from 'react';
import api from '../api';

const ConcertForm = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    api.post('/concerts', { name, date })
      .then(() => {
        setName('');
        setDate('');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Concert Name" value={name} onChange={e => setName(e.target.value)} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <button type="submit">Add Concert</button>
    </form>
  );
};

export default ConcertForm;
