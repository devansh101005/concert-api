import React, { useState } from 'react';
import api from '../api';

const ConcertForm = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || !date) {
      setError('Please provide both concert name and date.');
      return;
    }
    setLoading(true);
    api.post('/concerts', { name, date })
      .then(() => {
        setName('');
        setDate('');
        setSuccess('Concert added successfully!');
      })
      .catch(() => {
        setError('Failed to add concert. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Concert Name"
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={loading}
      />
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Concert'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  );
};

export default ConcertForm;
