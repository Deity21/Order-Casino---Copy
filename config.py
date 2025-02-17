import os

class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///user.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    NOWPAYMENTS_API_KEY = 'SYQBZGQ-C3F4EQ5-NH9QEJ3-ECRYVHT'  # Replace with your API key

    ADMIN_EMAIL = "admin@casino.com"
    ADMIN_PASSWORD = "AdminPass123"  # You can hash this if needed