import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReviewList from "./ReviewList"; // Import your ReviewList component
import "./BookDetails.css"; // Import your CSS file for styling

function BookDetails() {
  const { bookId } = useParams(); // Get the bookId from the URL
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [editReviewId, setEditReviewId] = useState(null);
  const [editReviewContent, setEditReviewContent] = useState("");
  const isAuthenticated = Boolean(localStorage.getItem("jwt_token")); // Replace with actual auth check

  const navigate = useNavigate();
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const bookResponse = await fetch(`/book/${bookId}`);
        if (!bookResponse.ok) {
          throw new Error("Failed to fetch book details");
        }
        const bookData = await bookResponse.json();
        setBook(bookData);

        const reviewsResponse = await fetch(`/review/book/${bookId}`);
        if (!reviewsResponse.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching book details or reviews:", error);
      }
    };

    fetchBookDetails();
  }, [bookId]); // Dependency on bookId to refetch if it changes

  const addReview = async () => {
    if (newReview.trim()) {
      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch(
          `/book_detail/${bookId}`, // Corrected endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: newReview,
              rating: 5, // Consider adding a field for rating if user input is required
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add review");
        }

        const newReviewData = await response.json();

        setReviews((prev) => [
          ...prev,
          {
            id: newReviewData.id,
            content: newReviewData.content,
            rating: newReviewData.rating,
          },
        ]);
        setNewReview("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const editReview = async () => {
    if (editReviewContent.trim()) {
      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch(`/review/${editReviewId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editReviewContent }),
        });

        if (!response.ok) {
          throw new Error("Failed to update review");
        }

        const updatedReview = await response.json();

        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === updatedReview.id ? updatedReview : review
          )
        );
        setEditReviewId(null);
        setEditReviewContent("");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(`/review/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }
      // Remove the review from the state
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.id !== reviewId)
      );
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (!book) return <div>Loading...</div>;

  return (
    <div className="book-details">
      <h2>{book.title}</h2>
      <p>
        <strong>Author:</strong> {book.author}
      </p>
      <p>
        <strong>Genre:</strong> {book.genre}
      </p>
      <p>
        <strong>Description:</strong> {book.description}
      </p>
      <p>
        <strong>Published:</strong> {book.published}
      </p>
      <p>
        <strong>ISBN:</strong> {book.isbn}
      </p>
      <p>
        <strong>Pages:</strong> {book.pages}
      </p>
      <p>
        <strong>Language:</strong> {book.language}
      </p>

      <ReviewList
        reviews={reviews}
        onEdit={setEditReviewId}
        onDelete={deleteReview}
      />

      <div className="review-form">
        {/* {error && <div className="error-message">{error}</div>} */}
        <input
          type="text"
          placeholder="Add a review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
        />
        {isAuthenticated ? (
          <button onClick={addReview}>Add Review</button>
        ) : (
          <button onClick={() => navigate("/login")}>Add Review</button>
        )}
      </div>

      {editReviewId && (
        <div className="edit-review">
          <h3>Edit Review</h3>
          <input
            type="text"
            value={editReviewContent}
            onChange={(e) => setEditReviewContent(e.target.value)}
          />
          <button onClick={editReview}>Save Changes</button>
          <button onClick={() => setEditReviewId(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default BookDetails;
