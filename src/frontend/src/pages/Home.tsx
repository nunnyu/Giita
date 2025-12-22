import React, { useEffect } from 'react';

const Home: React.FC = () => {
  useEffect(() => {
    fetch('http://localhost:5000/api/test-db')
      .then(res => res.json())
      .then(data => {
        console.log('Backend API test:', data);
      })
      .catch(err => {
        console.error('Backend API error:', err);
      });
  }, []);

  return (
    <div className="w-full max-h-screen text-center pt-[200px]">
      <h1 className="text-4xl font-bold mb-4 text-dark-50">Welcome</h1>
      <p className="text-lg text-dark-200">Practice, simplified.</p>
    </div>
  );
};

export default Home;