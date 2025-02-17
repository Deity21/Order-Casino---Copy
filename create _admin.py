from app import app, db, User  # Import `app` to use app context
from werkzeug.security import generate_password_hash

def create_admin(username, email, password):
    with app.app_context():  # ✅ Create an application context
        existing_admin = User.query.filter_by(email=email).first()
        if existing_admin:
            print(f"❌ Admin with email {email} already exists!")
            return

        hashed_password = generate_password_hash(password)
        new_admin = User(
            username=username,
            email=email,
            password=hashed_password,
            is_admin=True
        )

        db.session.add(new_admin)
        db.session.commit()
        print(f"✅ Admin {username} created successfully!")

# ✅ Run the function inside app context
if __name__ == "__main__":
    create_admin("AdminUser", "admin@casino.com", "AdminPass123")
