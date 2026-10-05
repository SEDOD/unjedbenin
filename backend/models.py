"""
Modèles de base de données pour le backend UNJED-BENIN.

Chaque classe = une table. `to_dict()` expose uniquement les champs
nécessaires au frontend (jamais de hash de mot de passe, jamais de secret).
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class Admin(db.Model):
    """Compte administrateur."""
    __tablename__ = "admins"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    display_name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {"id": self.id, "username": self.username, "display_name": self.display_name}


class Post(db.Model):
    """Publications : annonces, documents/décisions PDF, photos et vidéos."""
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)          # titre affiché (plafond vérifié côté route)
    body = db.Column(db.Text, nullable=True)                   # contenu libre (plafond vérifié côté route)
    post_type = db.Column(db.String(30), nullable=False, default="announcement")
    visibility = db.Column(db.String(10), nullable=False, default="public")  # "public" ou "members"
    file_url = db.Column(db.String(500), nullable=True)        # chemin interne généré (UUID), jamais le nom d'origine
    original_filename = db.Column(db.String(255), nullable=True)  # nom d'origine assaini, pour le téléchargement
    external_url = db.Column(db.String(500), nullable=True)    # lien externe http(s) uniquement (validé côté route)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    author_id = db.Column(db.Integer, db.ForeignKey("admins.id"), nullable=True)

    author = db.relationship("Admin")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "post_type": self.post_type,
            "visibility": self.visibility,
            "file_url": self.file_url,
            "original_filename": self.original_filename,
            "external_url": self.external_url,
            "created_at": self.created_at.strftime("%d %B %Y") if self.created_at else None,
            "author": self.author.display_name if self.author else "Bureau Exécutif",
        }


class Subscriber(db.Model):
    """Abonnés aux actualités."""
    __tablename__ = "subscribers"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {"id": self.id, "email": self.email, "created_at": self.created_at.isoformat()}


class Member(db.Model):
    """Demandes d'adhésion en ligne (formulaire public, modérées par le bureau)."""
    __tablename__ = "members"

    id = db.Column(db.Integer, primary_key=True)
    member_type = db.Column(db.String(50), default="Personne physique")
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    dept_or_region = db.Column(db.String(100), nullable=True)
    profile = db.Column(db.String(100), nullable=True, default="")
    motivation = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "member_type": self.member_type,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "country": self.country,
            "dept_or_region": self.dept_or_region,
            "profile": self.profile,
            "motivation": self.motivation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ContactMessage(db.Model):
    """Messages du formulaire Contact (lecture réservée aux administrateurs)."""
    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    subject = db.Column(db.String(200), nullable=True)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
