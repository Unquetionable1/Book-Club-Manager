import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import "./UserProfile.css"; // Import the CSS file for styling

function UserProfile() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [newFavorite, setNewFavorite] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("jwt_token");
        const response = await fetch("/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUser(data);
        setFavorites(data.favorites || []);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const addFavorite = async () => {
    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch("/user/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: newFavorite }),
      });
      if (!response.ok) {
        throw new Error("Failed to add favorite book");
      }

      const data = await response.json();
      setFavorites((prev) => [
        ...prev,
        { id: data.id, title: data.title, author: data.author }, // Updated to use real data
      ]);
      setNewFavorite("");
    } catch (error) {
      console.error("Error adding favorite book:", error);
    }
  };

  const removeFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch("/user/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ book_id: bookId }),
      });
      if (!response.ok) {
        throw new Error("Failed to remove favorite book");
      }

      setFavorites((prev) => prev.filter((book) => book.id !== bookId));
    } catch (error) {
      console.error("Error removing favorite book:", error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{user.username}'s Profile</h2>
      <h3>Favorites</h3>
      <div className="add-favorite">
        <input
          type="text"
          value={newFavorite}
          onChange={(e) => setNewFavorite(e.target.value)}
          placeholder="Enter book ID"
        />
        <button onClick={addFavorite}>Add Favorite</button>
      </div>
      <div className="book-list">
        {favorites.length > 0 ? (
          favorites.map((book) => (
            <div key={book.id} className="book-card-container">
              <BookCard book={book} />
              <button
                className="removefav"
                onClick={() => removeFavorite(book.id)}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No favorite books found.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
