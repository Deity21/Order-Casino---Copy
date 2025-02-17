import os
from dotenv import load_dotenv

load_dotenv()  # ✅ Load environment variables

class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'postgresql://user_tphc_user:4cDudUnZXbqvkGIImTrrcY1KduZKomeE@dpg-cuphmhd6l47c73cmiqt0-a/user_tphc'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    NOWPAYMENTS_API_KEY = 'SYQBZGQ-C3F4EQ5-NH90EJ3-ECRVYHT'  # Replace with your actual key

    ADMIN_EMAIL = "admin@casino.com"
    ADMIN_PASSWORD = "AdminPass123"  # You can hash this if needed

    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")  # ✅ Fix: Use os.environ.get()
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")  # ✅ Fix: Use os.environ.get()
