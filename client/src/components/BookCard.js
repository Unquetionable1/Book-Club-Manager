import React, { useState, useEffect } from 'react';
import './BookCard.css'; // Import the CSS file for styling

function BookCard({ book }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editReview, setEditReview] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:5555/review/book/${book.id}`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const addReview = async () => {
    if (newReview.trim()) {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:5555/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: newReview,
            rating: 5, // Assuming a default rating, you can change this
            book_id: book.id
          })
        });

        const data = await response.json();
        setReviews([...reviews, data]);
        setNewReview('');
      } catch (error) {
        console.error('Error adding review:', error);
      }
    }
  };

  const updateReview = async () => {
    if (editReview.trim()) {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://localhost:5555/review/${reviews[editIndex].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: editReview,
            rating: 5, // Assuming a default rating, you can change this
            book_id: book.id
          })
        });

        const data = await response.json();
        const updatedReviews = [...reviews];
        updatedReviews[editIndex] = data;
        setReviews(updatedReviews);
        setEditIndex(-1);
        setEditReview('');
      } catch (error) {
        console.error('Error updating review:', error);
      }
    }
  };

  const deleteReview = async (index) => {
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`http://localhost:5555/review/${reviews[index].id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setReviews(reviews.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="book-card">
      <img
        src={book.image || 'https://via.placeholder.com/150'}
        alt={book.title}
        className="book-image"
      />
      <h3>{book.title}</h3>
      <p>
        <strong>Author:</strong> {book.author}
      </p>
      <p>
        <strong>Genre:</strong> {book.genre}
      </p>
      <p>
        <strong>Description:</strong> {book.description}
      </p>

      <div className="review-section">
        <h4>Reviews</h4>
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review, index) => (
              <li key={index}>
                {editIndex === index ? (
                  <div>
                    <input
                      type="text"
                      value={editReview}
                      onChange={(e) => setEditReview(e.target.value)}
                    />
                    <button onClick={updateReview}>Update</button>
                  </div>
                ) : (
                  <div>
                    <span>{review.content}</span>
                    <button onClick={() => setEditIndex(index) & setEditReview(review.content)}>Edit</button>
                    <button onClick={() => deleteReview(index)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet.</p>
        )}
        <div className="review-form">
          <input
            type="text"
            placeholder="Add a review..."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
          />
          <button className='addReview' onClick={addReview}>Add Review</button>
        </div>
      </div>
    </div>
  );
}

export default BookCard;
