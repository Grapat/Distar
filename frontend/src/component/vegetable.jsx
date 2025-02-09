import { useState, useEffect } from "react";

export default function Vegetable() {
  const [vegetables, setVegetables] = useState([]);  // State for storing vegetables
  const [loading, setLoading] = useState(true);  // State for loading indicator
  const [error, setError] = useState(null);  // State for error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4005/api/vegs');
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVegetables(data);  // Update state with fetched vegetables
      } catch (err) {
        setError(err.message);  // Handle any errors
      } finally {
        setLoading(false);  // Stop loading after data is fetched
      }
    };

    fetchData();  // Call fetchData inside useEffect
  }, []);  // Empty dependency array to run once on component mount

  if (loading) {
    return <h1>Loading...</h1>;  // Display loading message
  }

  if (error) {
    return <h1>Error: {error}</h1>;  // Display error message
  }

  return (
    <div>
      <h1>Vegetables</h1>
      <ul>
        {vegetables.map((veg, index) => (
          <li key={index}>{veg.name}</li>
        ))}
      </ul>
    </div>
  );
}