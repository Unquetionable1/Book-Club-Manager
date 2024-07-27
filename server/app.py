import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify, render_template
from flask_migrate import Migrate
from flask_restful import Resource, Api
from flask_cors import CORS
from models import db, User, Book, Review, UserBook, bcrypt
from datetime import datetime, timedelta
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    JWTManager,
)

app = Flask(
    __name__,
    static_url_path="",
    static_folder="../client/build",
    template_folder="../client/build",
)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "my_secret_key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
app.json.compact = False
jwt = JWTManager(app)

# Initialize the database and migration tool
db.init_app(app)
migrate = Migrate(app, db)

# Instantiate REST API
api = Api(app)
# Instantiate CORS
CORS(app)


@app.errorhandler(404)
def not_found(e):
    return render_template("index.html")


class BookResource(Resource):
    def get(self, id=None):
        try:
            if id is None:
                books = [book.to_dict() for book in Book.query.all()]
                return jsonify(books)
            else:
                book = Book.query.get_or_404(id)
                return jsonify(book.to_dict())
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        try:
            current_user_email = get_jwt_identity()
            user = User.query.filter_by(email=current_user_email).first()
            new_book = Book(
                title=data["title"],
                author=data["author"],
                genre=data["genre"],
                published_date=datetime.strptime(
                    data["published_date"], "%Y-%m-%d"
                ).date(),
                user_id=user.id,
            )
            db.session.add(new_book)
            db.session.commit()
            return jsonify(new_book.to_dict())
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def put(self, id=None):
        if id is None:
            return {"message": "ID must be provided for update"}, 400

        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        try:
            book = Book.query.get_or_404(id)
            current_user_email = get_jwt_identity()
            user = User.query.filter_by(email=current_user_email).first()
            if book.user_id != user.id:
                return {"message": "You can only edit your own books"}, 403

            book.title = data.get("title", book.title)
            book.author = data.get("author", book.author)
            book.genre = data.get("genre", book.genre)

            if "published_date" in data:
                book.published_date = datetime.strptime(
                    data["published_date"], "%Y-%m-%d"
                ).date()

            db.session.commit()
            return jsonify(book.to_dict()), 200
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def delete(self, id=None):
        if id is None:
            return {"message": "ID must be provided for delete"}, 400

        try:
            book = Book.query.get_or_404(id)
            current_user_email = get_jwt_identity()
            user = User.query.filter_by(email=current_user_email).first()
            if book.user_id != user.id:
                return {"message": "You can only delete your own books"}, 403

            db.session.delete(book)
            db.session.commit()
            return {"message": "Book deleted"}, 204
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(BookResource, "/book", "/book/<int:id>")


class ReviewResource(Resource):
    def get(self, id=None):
        try:
            if id is None:
                reviews = [review.to_dict() for review in Review.query.all()]
                return jsonify(reviews)
            else:
                reviews = Review.query.filter_by(book_id=id).all()
                return jsonify([review.to_dict() for review in reviews])
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        try:
            current_user_id = get_jwt_identity()
            user = User.query.filter_by(id=current_user_id).first()
            new_review = Review(
                content=data["content"],
                rating=data["rating"],
                book_id=data["book_id"],
                user_id=user.id,
            )
            db.session.add(new_review)
            db.session.commit()
            return jsonify(new_review.to_dict()), 201
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def put(self, id=None):
        if id is None:
            return {"message": "ID must be provided for update"}, 400

        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        try:
            review = Review.query.get_or_404(id)
            current_user_id = get_jwt_identity()
            user = User.query.filter_by(id=current_user_id).first()
            if review.user_id != user.id:
                return {"message": "You can only edit your own reviews"}, 403

            review.content = data.get("content", review.content)
            review.rating = data.get("rating", review.rating)
            review.book_id = data.get("book_id", review.book_id)

            db.session.commit()
            return jsonify(review.to_dict()), 200
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def delete(self, id=None):
        if id is None:
            return {"message": "ID must be provided for delete"}, 400

        try:
            review = Review.query.get_or_404(id)
            current_user_id = get_jwt_identity()
            user = User.query.filter_by(id=current_user_id).first()
            if review.user_id != user.id:
                return {"message": "You can only delete your own reviews"}, 403

            db.session.delete(review)
            db.session.commit()
            return {"message": "Review deleted"}, 204
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(ReviewResource, "/review", "/review/<int:id>", "/review/book/<int:id>")


class UserResource(Resource):
    def get(self, id=None):
        try:
            if id is None:
                users = [user.to_dict() for user in User.query.all()]
                return jsonify(users)
            else:
                user = User.query.get_or_404(id)
                return jsonify(user.to_dict())
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(UserResource, "/user", "/user/<int:id>")


class UserBookResource(Resource):
    def get(self, id=None):
        try:
            if id is None:
                user_books = [user_book.to_dict() for user_book in UserBook.query.all()]
                return jsonify(user_books)
            else:
                user_book = UserBook.query.get_or_404(id)
                return jsonify(user_book.to_dict())
        except Exception as e:
            return {"message": str(e)}, 500

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            return {"message": "No input data provided"}, 400

        try:
            new_user_book = UserBook(user_id=data["user_id"], book_id=data["book_id"])
            db.session.add(new_user_book)
            db.session.commit()
            return jsonify(new_user_book.to_dict())
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(UserBookResource, "/userbook", "/userbook/<int:id>")


@app.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify(message="Missing required fields"), 400

    user_exists = User.query.filter_by(username=username).first()

    if user_exists:
        return jsonify(message="User already exists"), 409

    new_user = User(
        username=username,
        email=email,
        _password=bcrypt.generate_password_hash(password).decode("utf-8"),
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message=f"User {username} added successfully"), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user._password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, user_id=user.id), 200
    return jsonify({"msg": "Bad email or password"}), 401


@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200


@app.route("/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user is None:
        return jsonify({"error": "User not found"}), 404

    favorite_books = user.favorite_books

    user_profile = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "favorites": [book.to_dict() for book in favorite_books],
    }

    return jsonify(user_profile), 200


class FavoriteResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        book_id = data.get("book_id")
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user is None:
            return {"error": "User not found"}, 404

        book = Book.query.get(book_id)
        if book is None:
            return {"error": "Book not found"}, 404

        if book in user.favorite_books:
            return {"error": "Book already in favorites"}, 400

        user_book = UserBook(user=user, book=book)
        db.session.add(user_book)
        db.session.commit()

        return book.to_dict(), 200

    @jwt_required()
    def delete(self):
        data = request.get_json()
        book_id = data.get("book_id")
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user is None:
            return {"error": "User not found"}, 404

        book = Book.query.get(book_id)
        if book is None:
            return {"error": "Book not found"}, 404

        if book not in user.favorite_books:
            return {"error": "Book not in favorites"}, 400

        user_book = UserBook.query.filter_by(
            user_id=current_user_id, book_id=book_id
        ).first()
        if user_book:
            db.session.delete(user_book)
            db.session.commit()
            return {"message": "Book removed from favorites"}, 200

        return {"error": "Failed to remove book from favorites"}, 500


api.add_resource(FavoriteResource, "/user/favorites")


class BookDetails(Resource):
    def get(self, book_id):
        book = Book.query.get(book_id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        reviews = Review.query.filter_by(book_id=book_id).all()
        reviews_list = [
            review.to_dict() for review in reviews
        ]  # Ensure `to_dict` method in Review model

        return (
            jsonify(
                {
                    "book": book.to_dict(),  # Ensure `to_dict` method in Book model
                    "reviews": reviews_list,
                }
            ),
            200,
        )

    @jwt_required()
    def post(self, book_id):
        data = request.get_json()
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user is None:
            return jsonify({"error": "User not found"}), 404

        book = Book.query.get(book_id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        review = Review(
            content=data["content"],
            rating=data["rating"],
            book_id=book_id,
            user_id=current_user_id,
        )

        db.session.add(review)
        db.session.commit()

        return jsonify(review.to_dict()), 201


api.add_resource(BookDetails, "/book_detail/<int:book_id>")
