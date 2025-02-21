from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from config import Config
from sqlalchemy.orm import Session
import requests

from flask_mail import Mail, Message

# ✅ Flask-Mail Configuration



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user_tphc_user:4cDudUnZXbqvkGIImTrrcY1KduZKomeE@dpg-cuphmhd6l47c73cmiqt0-a.oregon-postgres.render.com/user_tphc'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'
app.config.from_object(Config)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Change if using another provider
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'alexdarwinger@gmail.com'  # 🔥 Your email here
app.config['MAIL_PASSWORD'] = 'gcjj xjml rvfs crqs'  # 🔥 Use an App Password
app.config['MAIL_DEFAULT_SENDER'] = ('Glamorilla slot', 'feeltherush@memerushrevolution.com')

mail = Mail(app)

db = SQLAlchemy(app) 

ADMIN_CREDENTIALS = {
    "email": "admin@casino.com",
    "password": "AdminPass123"
}

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=True)  # ✅ Allow null if not required
    password = db.Column(db.String(200), nullable=False)
    profile_pic = db.Column(db.String(200), default='./static/images/default.png')
    balance = db.Column(db.Float, default=100.0)
    deposit_amount = db.Column(db.Float, default=0.0)
    bet_amount = db.Column(db.Float, default=0.0)
    is_banned = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)

# Deposit/Withdrawal model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'deposit' or 'withdrawal'
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    
class GameLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    bet = db.Column(db.Float, nullable=False)
    winnings = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    
class Withdrawal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    network = db.Column(db.String(50), nullable=False)
    wallet_address = db.Column(db.String(255), nullable=False)
    withdraw_type = db.Column(db.String(20), nullable=False)  # ✅ "money" or "nft"
    status = db.Column(db.String(20), default='Pending', nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    
class Deposit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), nullable=False, default='USDT')
    network = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')
    payment_id = db.Column(db.String(100), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Add timestamp
    
class Announcement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Announcement {self.id} - {self.title}>"


# Initialize the database

@app.route('/')
def index():
    user = None
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
    return render_template('index.html', user=user)

@app.route('/homepage')
def homepage():
    user = None
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
    return render_template('homepage.html', user=user)

@app.route('/NewSlots')
def NewSlots():
    if 'user_id' not in session:
        return redirect(url_for('homepage'))
    user = User.query.get(session['user_id'])
    return render_template('NewSlots.html', user=user)

@app.route('/slot')
def slot():
    if 'user_id' not in session:
        return redirect(url_for('homepage'))
    user = User.query.get(session['user_id'])
    return render_template('slot.html', user=user)




@app.route('/profile', methods=['GET'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('homepage'))

    user = User.query.get(session['user_id'])

    # If accessed via JSON request
    if request.headers.get('Content-Type') == 'application/json':
        transactions = Transaction.query.filter_by(user_id=user.id).all()
        transaction_list = [
            {"type": t.type, "amount": t.amount, "timestamp": t.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
            for t in transactions
        ]
        return jsonify({
            'username': user.username,
            'profile_pic': user.profile_pic,
            'balance': user.balance,
            'transactions': transaction_list
        }), 200

    # Default render for browser request
    return render_template('profile.html', user=user)

@app.route('/whitepaper')
def whitepaper():
    if 'user_id' not in session:
        return redirect(url_for('homepage'))
    user = User.query.get(session['user_id'])
    return render_template('whitepaper.html', user=user)

@app.route('/game1')
def game1():
    if 'user_id' not in session:
        return redirect(url_for('homepage'))  # Redirect to homepage if not logged in
    return render_template('game1.html')


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        username = data.get('username')  # ✅ Capture username from the request
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"error": "All fields are required!"}), 400

        # Check if the user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered."}), 400

        hashed_password = generate_password_hash(password)

        # ✅ Ensure you include `username` in the new user instance
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            profile_pic="./static/images/default.png",  # Default profile picture
            balance=100.0,  # Example default balance
            deposit_amount=0.0,
            bet_amount=0.0,
            is_banned=False,
            is_admin=False
        )

        db.session.add(new_user)
        db.session.commit()
        
        send_email(email, "Welcome to Glamorilla!", "emails_signup.html", username=username)

        return jsonify({"redirect": "/dashboard"}), 200  # Redirect to user dashboard

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
# ✅ Route: Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required!'}), 400

    # ✅ Check if Admin
    if email == ADMIN_CREDENTIALS["email"] and password == ADMIN_CREDENTIALS["password"]:
        session.clear()  # Clear any previous session
        session['admin'] = True
        session.permanent = True  # ✅ Make session persistent

        print(f"✅ Admin Session Created: {session}")  # Debugging
        return jsonify({'message': 'Admin login successful.', 'redirect': url_for('admin_dashboard')}), 200

    # ✅ Regular User Check
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password!'}), 401

    # ✅ Set user session
    session.clear()
    session['user_id'] = user.id
    session['is_admin'] = user.is_admin
    session.permanent = True  # ✅ Keep session active

    if user.is_admin:
        return jsonify({'message': 'Admin login successful.', 'redirect': url_for('admin_dashboard')}), 200
    else:
        return jsonify({'message': 'Login successful.', 'redirect': url_for('homepage')}), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully.'}), 200

@app.route('/update-username', methods=['POST'])
def update_username():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in.'}), 401
    
    data = request.json
    new_username = data.get('username')
    
    if not new_username:
        return jsonify({'error': 'New username is required.'}), 400
    
    # Check if the username is already taken
    existing_user = User.query.filter_by(username=new_username).first()
    if existing_user:
        return jsonify({'error': 'Username already exists. Choose a different one.'}), 400
    
    # Update the username
    user = User.query.get(session['user_id'])
    user.username = new_username
    db.session.commit()
    
    return jsonify({'message': 'Username updated successfully.', 'username': new_username}), 200

@app.route('/update-profile-pic', methods=['POST'])
def update_profile_pic():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in.'}), 401

    file = request.files.get('profile_pic')
    if not file:
        return jsonify({'error': 'Profile picture is required.'}), 400

    # Ensure the upload directory exists
    upload_folder = 'static/uploads'
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Save the uploaded file
    file_path = os.path.join(upload_folder, file.filename)
    file.save(file_path)

    # Update the user's profile picture in the database
    user = User.query.get(session['user_id'])
    user.profile_pic = file_path
    db.session.commit()

    return jsonify({'message': 'Profile picture updated successfully.', 'profile_pic_url': file_path}), 200

@app.route('/add-transaction', methods=['POST'])
def add_transaction():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in.'}), 401

    data = request.json
    transaction_type = data.get('type')  # 'deposit' or 'withdrawal'
    amount = data.get('amount')

    if not transaction_type or not amount:
        return jsonify({'error': 'Transaction type and amount are required.'}), 400

    user = User.query.get(session['user_id'])

    if transaction_type == 'withdrawal' and user.balance < amount:
        return jsonify({'error': 'Insufficient balance for withdrawal.'}), 400

    # Update balance
    if transaction_type == 'deposit':
        user.balance += amount
    elif transaction_type == 'withdrawal':
        user.balance -= amount

    # Record transaction
    transaction = Transaction(user_id=user.id, type=transaction_type, amount=amount)
    db.session.add(transaction)
    db.session.commit()

    return jsonify({'message': f'{transaction_type.capitalize()} successful.', 'balance': user.balance}), 200

@app.route('/get-balance', methods=['GET'])
def get_balance():
    if 'user_id' not in session:
        app.logger.warning("Balance check failed: User not logged in")
        return jsonify({'error': 'User not logged in.'}), 401

    user = User.query.get(session['user_id'])
    if not user:
        app.logger.error("Balance check failed: User not found")
        return jsonify({'error': 'User not found.'}), 404

    app.logger.info(f"Balance fetched successfully for user {user.username}: ${user.balance}")
    return jsonify({'balance': user.balance}), 200

@app.route('/update-balance', methods=['POST'])
def update_balance():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    amount = data.get('amount')

    if amount is None or not isinstance(amount, (int, float)):
        return jsonify({'error': 'Invalid amount'}), 400

    if user.balance + amount < 0:
        return jsonify({'error': 'Insufficient balance'}), 400

    # If the amount is negative, it's a bet -> Track bet amount
    if amount < 0:
        user.bet_amount += abs(amount)  # Track total bet amount

    user.balance += amount  # Deduct or add based on the amount
    db.session.commit()

    return jsonify({
        'balance': user.balance,
        'bet_amount': user.bet_amount,  # Send updated bet amount
        'message': 'Balance updated successfully'
    }), 200



@app.route('/user-info', methods=['GET'])
def user_info():
    if 'user_id' not in session:
        app.logger.error("User not logged in.")
        return jsonify({'error': 'User not logged in.'}), 401

    user = User.query.get(session['user_id'])
    if not user:
        app.logger.error("User not found in database.")
        return jsonify({'error': 'User not found.'}), 404

    app.logger.info(f"Fetched user info for {user.username}")
    return jsonify({'username': user.username, 'balance': user.balance}), 200


@app.route('/log-game', methods=['POST'])
def log_game():
    """Logs a game result into the database from the frontend"""
    data = request.get_json()
    
    # Ensure all required data is received
    bet = data.get('bet', 0)
    winnings = data.get('winnings', 0)
    balance = data.get('balance', 0)

    if bet < 0 or balance < 0:  # Sanity check
        return jsonify({'error': 'Invalid data provided!'}), 400

    # Store log in the database
    new_log = GameLog(bet=bet, winnings=winnings, balance=balance)
    db.session.add(new_log)
    db.session.commit()

    return jsonify({'message': 'Game logged successfully', 'log_id': new_log.id}), 200


@app.route('/get-logs', methods=['GET'])
def get_logs():
    """Retrieves all game logs for the admin panel"""
    logs = GameLog.query.order_by(GameLog.timestamp.desc()).all()
    
    log_list = [{
        'id': log.id,
        'timestamp': log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        'bet': log.bet,
        'winnings': log.winnings,
        'balance': log.balance
    } for log in logs]

    return jsonify(log_list), 200


@app.route('/get-vip-progress', methods=['GET'])
def get_vip_progress():
    if 'user_id' not in session:
        return jsonify({"error": "User not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "deposit_amount": user.deposit_amount,
        "bet_amount": user.bet_amount
    })

@app.route('/submit-withdrawal', methods=['POST'])
def submit_withdrawal():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    try:
        data = request.get_json()
        amount = float(data.get('amount', 0))
        network = data.get('network', '').strip()
        wallet_address = data.get('walletAddress', '').strip()
        withdraw_type = data.get('type', '').strip().lower()  # ✅ "money" or "nft"

        if withdraw_type not in ['money', 'nft']:
            return jsonify({'error': 'Invalid withdrawal type. Must be Money or NFT.'}), 400

        if amount < 20:
            return jsonify({'error': 'Withdrawal amount must be at least $20.'}), 400

        if not wallet_address:
            return jsonify({'error': 'Wallet address is required.'}), 400

        if user.balance < amount:
            return jsonify({'error': 'Insufficient balance.'}), 400

        # Deduct balance before adding withdrawal request
        user.balance -= amount
        db.session.commit()

        # Store withdrawal request in DB
        new_withdrawal = Withdrawal(
            user_id=user.id,
            amount=amount,
            network=network,
            wallet_address=wallet_address,
            withdraw_type=withdraw_type,  
            status='Pending'
        )
        db.session.add(new_withdrawal)
        db.session.commit()

        # ✅ Notify User via Email
        send_email(
            user.email, 
            "Withdrawal Request Submitted", 
            "emails_withdrawal.html",
            username=user.username, 
            amount=amount, 
            withdraw_type=withdraw_type
        )

        # ✅ Notify Admin via Email
        admin_email = "Oniraphael37@gmail.com"  # Update with real admin email
        send_email(
            admin_email,
            f"New Withdrawal Request from {user.username}",
            "emails_admin_withdrawal.html",
            username=user.username,
            amount=amount,
            network=network,
            wallet_address=wallet_address,
            withdraw_type=withdraw_type
        )

        return jsonify({'success': True, 'message': f'Withdrawal ({withdraw_type}) submitted successfully!', 'new_balance': user.balance}), 200

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500



@app.route('/create-deposit', methods=['POST'])
def create_deposit():
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    data = request.get_json()
    amount = data.get('amount')
    network = data.get('network', "").strip().upper()

    # ✅ Corrected USDT Network Mapping Based on NowPayments API Response
    network_mapping = {
        "TRC20": "usdttrc20",  # USDT on Tron
        "ERC20": "usdterc20",  # USDT on Ethereum
        "SOL": "usdtsol",
        "BEP20": "usdtbsc"     # USDT on Binance Smart Chain
        
    }

    if network not in network_mapping:
        return jsonify({'error': 'Invalid network. Use TRC20, ERC20, or BEP20.'}), 400

    pay_currency = network_mapping[network]

    # ✅ Fetch latest supported currencies from NowPayments to confirm it's available
    NOWPAYMENTS_API_KEY = app.config['NOWPAYMENTS_API_KEY']
    headers = {"x-api-key": NOWPAYMENTS_API_KEY}
    currency_response = requests.get("https://api.nowpayments.io/v1/currencies", headers=headers)
    supported_currencies = currency_response.json().get("currencies", [])

    if pay_currency not in supported_currencies:
        return jsonify({'error': f'{pay_currency} is not supported by NowPayments'}), 400

    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404

    timestamp = int(datetime.utcnow().timestamp())
    order_id = f"user_{user.id}_{timestamp}"
    print(f"Generated Order ID: {order_id}")  # ✅ Debugging

    payload = {
        "price_amount": amount,
        "price_currency": "usd",
        "pay_currency": pay_currency,  # ✅ Correct format for NowPayments
        "order_id": order_id,
        "ipn_callback_url": "https://yourdomain.com/nowpayments-webhook"
    }

    response = requests.post("https://api.nowpayments.io/v1/invoice", json=payload, headers=headers)
    data = response.json()

    print("NowPayments Response:", response.status_code, data)  # ✅ Debugging

    if response.status_code != 200 or not data.get('invoice_url'):
        return jsonify({'error': 'Failed to create deposit link', 'response': data}), 500

    payment_id = data.get('id')
    if not payment_id:
        return jsonify({'error': 'No payment ID returned from NowPayments'}), 500

    deposit = Deposit(
        user_id=user.id,
        amount=amount,
        network=network,
        status="Pending",
        payment_id=payment_id
    )
    db.session.add(deposit)
    db.session.commit()

    return jsonify({"success": True, "payment_url": data.get('invoice_url')})



@app.route('/nowpayments-webhook', methods=['POST'])
def nowpayments_webhook():
    data = request.get_json()
    payment_id = data.get("payment_id")
    status = data.get("payment_status")

    if not payment_id:
        return jsonify({"error": "Invalid webhook data"}), 400

    deposit = Deposit.query.filter_by(payment_id=payment_id).first()
    if not deposit:
        return jsonify({"error": "Deposit not found"}), 404

    # Update deposit status
    deposit.status = status
    if status == "finished":
        user = User.query.get(deposit.user_id)
        user.balance += deposit.amount  # ✅ Add balance to user
        db.session.commit()

    return jsonify({"success": True}), 200

import traceback  # ✅ Import for better debugging

@app.route('/confirm-deposit', methods=['POST'])
def confirm_deposit():
    data = request.get_json()
    user = User.query.get(session['user_id'])
    
    if user:
        user.balance += data['amount']
        db.session.commit()

        # ✅ Send Email
        send_email(user.email, "Deposit Confirmation", "emails_deposit.html", username=user.username, amount=data['amount'], balance=user.balance)

    return jsonify({"message": "Deposit confirmed!"}), 200


@app.route('/admin/dashboard')
def admin_dashboard():
    if not session.get('admin'):
        return redirect(url_for('homepage'))  # ✅ Ensure only admins can access

    try:
        users_count = User.query.count()
        total_deposits = db.session.query(db.func.sum(Deposit.amount)).scalar() or 0
        total_withdrawals = db.session.query(db.func.sum(Withdrawal.amount)).scalar() or 0

        return render_template('admin_dashboard.html',  # ✅ Render the correct template
                               users_count=users_count, 
                               total_deposits=total_deposits, 
                               total_withdrawals=total_withdrawals)
    except Exception as e:
        print(f"❌ Error fetching admin data: {e}")
        return "Error loading admin panel", 500


# ✅ Ban/Unban User
@app.route('/admin/ban-user/<int:user_id>', methods=['POST'])
def ban_user(user_id):
    if 'admin' not in session:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    if user:
        user.is_banned = not user.is_banned  # Toggle Ban
        db.session.commit()
        return jsonify({'message': 'User ban status updated!'})
    
    return jsonify({'error': 'User not found'}), 404

# ✅ Manually Credit User
@app.route('/admin/credit-user/<int:user_id>', methods=['POST'])
def credit_user(user_id):
    if 'admin' not in session:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    amount = request.json.get('amount')

    if user and amount > 0:
        user.balance += amount
        db.session.commit()
        return jsonify({'message': 'User credited successfully!'})
    
    return jsonify({'error': 'Invalid request'}), 400

# ✅ Approve Withdrawal Request
@app.route('/admin/approve-withdrawal/<int:withdrawal_id>', methods=['POST'])
def approve_withdrawal(withdrawal_id):
    if 'admin' not in session:
        return jsonify({"error": "Unauthorized"}), 403

    withdrawal = Withdrawal.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({"error": "Withdrawal not found"}), 404

    withdrawal.status = "Approved"
    db.session.commit()

    # ✅ Send Email to User
    user = User.query.get(withdrawal.user_id)
    send_email(user.email, "✅ Withdrawal Approved", "withdrawal_approved.html",
               username=user.username, amount=withdrawal.amount, withdraw_type=withdrawal.withdraw_type)

    return jsonify({"message": "Withdrawal approved!"}), 200

# ✅ Reject Withdrawal Request
@app.route('/admin/reject-withdrawal/<int:withdrawal_id>', methods=['POST'])
def reject_withdrawal(withdrawal_id):
    if 'admin' not in session:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    reason = data.get("reason", "No specific reason provided.")

    withdrawal = Withdrawal.query.get(withdrawal_id)
    if not withdrawal:
        return jsonify({"error": "Withdrawal not found"}), 404

    withdrawal.status = "Rejected"
    db.session.commit()

    # ✅ Send Rejection Email to User
    user = User.query.get(withdrawal.user_id)
    send_email(user.email, "❌ Withdrawal Rejected", "withdrawal_rejected.html",
               username=user.username, amount=withdrawal.amount, withdraw_type=withdrawal.withdraw_type, reason=reason)

    return jsonify({"message": "Withdrawal rejected!"}), 200


# ✅ Logout Admin
@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('admin_login'))

@app.route('/get-announcements', methods=['GET'])
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.timestamp.desc()).all()

    announcement_list = [
        {
            "title": ann.title,
            "message": ann.message,
            "date": ann.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        }
        for ann in announcements
    ]
    
    return jsonify(announcement_list)


@app.route('/admin/manage-users')
def manage_users():
    if 'admin' not in session:
        return redirect(url_for('homepage'))

    users = User.query.all()
    return render_template('manage_users.html', users=users)


# ✅ Manage Deposits
@app.route('/admin/manage-deposits')
def manage_deposits():
    if 'admin' not in session:
        return redirect(url_for('homepage'))

    deposits = Deposit.query.all()
    return render_template('manage_deposits.html', deposits=deposits)


# ✅ Manage Withdrawals
@app.route('/admin/manage-withdrawals')
def manage_withdrawals():
    if 'admin' not in session:
        return redirect(url_for('homepage'))  # Redirect non-admin users

    withdrawals = db.session.query(
        Withdrawal.id,
        Withdrawal.user_id,
        User.username,
        Withdrawal.amount,
        Withdrawal.network,
        Withdrawal.wallet_address,
        Withdrawal.withdraw_type,
        Withdrawal.status,
        Withdrawal.timestamp
    ).join(User, Withdrawal.user_id == User.id).order_by(Withdrawal.timestamp.desc()).all()

    return render_template('manage_withdrawals.html', withdrawals=withdrawals)


# ✅ Game Logs
@app.route('/admin/game-logs')
def game_logs():
    if 'admin' not in session:
        return redirect(url_for('homepage'))

    logs = GameLog.query.order_by(GameLog.timestamp.desc()).all()
    return render_template('admin_game_logs.html', logs=logs)

@app.route('/admin/announcements', methods=['GET', 'POST'])
def admin_announcements():
    if 'admin' not in session:
        return redirect(url_for('homepage'))  # 🚫 Redirect non-admin users

    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        message = data.get('message')

        if not title or not message:
            return jsonify({'error': 'Title and message are required!'}), 400

        # ✅ Save the announcement in the database
        new_announcement = Announcement(title=title, message=message)
        db.session.add(new_announcement)
        db.session.commit()

        # ✅ Fetch all users from the database
        users = User.query.with_entities(User.email).all()
        recipient_emails = [user.email for user in users if user.email]  # Ensure emails exist

        # ✅ Send announcement emails
        if recipient_emails:
            try:
                msg = Message(f"📢 {title} - Glamorilla Casino", recipients=recipient_emails)
                msg.html = render_template('announcement_email.html', title=title, message=message)
                mail.send(msg)
                print("✅ Announcement emails sent successfully!")
            except Exception as e:
                print(f"❌ Error sending emails: {e}")

        return jsonify({'message': 'Announcement posted and emails sent successfully!'}), 200

    # ✅ Fetch all announcements for display in the admin panel
    all_announcements = Announcement.query.order_by(Announcement.timestamp.desc()).all()
    return render_template('admin_announcements.html', announcements=all_announcements)

@app.route('/admin/delete-announcement/<int:announcement_id>', methods=['POST'])
def delete_announcement(announcement_id):
    if 'admin' not in session:
        return jsonify({'error': 'Unauthorized'}), 403

    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404

    db.session.delete(announcement)
    db.session.commit()
    return jsonify({'message': 'Announcement deleted successfully!'}), 200

@app.route('/admin/game-logs')
def admin_game_logs():
    if 'admin' not in session:
        return redirect(url_for('homepage'))  # Redirect non-admin users

    logs = GameLog.query.order_by(GameLog.timestamp.desc()).all()
    
    return render_template('admin_game_logs.html', logs=logs)  # Ensure correct template name

def send_email(to, subject, template, **kwargs):
    try:
        msg = Message(subject, sender="your_email@glamorilla.com", recipients=[to])
        msg.html = render_template(template, **kwargs)
        mail.send(msg)
        print(f"✅ Email sent to {to}")
    except Exception as e:
        print(f"❌ Email error: {str(e)}")

@app.route('/get-transactions', methods=['GET'])
def get_transactions():
    """Fetch user's deposit and withdrawal transaction history."""
    if 'user_id' not in session:
        return jsonify({'error': 'User not logged in'}), 401

    user = db.session.get(User, session['user_id'])  # ✅ Use correct SQLAlchemy 2.0 syntax
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # ✅ Fetch Deposits
    deposits = Deposit.query.filter_by(user_id=user.id).order_by(Deposit.timestamp.desc()).all()

    # ✅ Fetch Withdrawals
    withdrawals = Withdrawal.query.filter_by(user_id=user.id).order_by(Withdrawal.timestamp.desc()).all()

    # ✅ Format transactions list
    transactions = []

    for deposit in deposits:
        transactions.append({
            'timestamp': deposit.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            'type': 'Deposit',
            'amount': deposit.amount,
            'status': 'Completed'  # Assuming all deposits are successful
        })

    for withdrawal in withdrawals:
        transactions.append({
            'timestamp': withdrawal.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            'type': 'Withdrawal',
            'amount': withdrawal.amount,
            'status': withdrawal.status  # ✅ Displays Pending, Approved, or Rejected
        })

    # ✅ Sort transactions by timestamp (latest first)
    transactions.sort(key=lambda x: x['timestamp'], reverse=True)

    return jsonify({'transactions': transactions})

with app.app_context():
    db.create_all()  # ✅ Ensure tables are created before running the app
    

if __name__ == '__main__':
    app.run(debug=True)
