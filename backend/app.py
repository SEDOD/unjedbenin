"""
Backend UNJED-BENIN — API Flask.

Sert :
- l'authentification des administrateurs (comptes individuels)
- la publication d'annonces / documents / liens / images / vidéos
- l'inscription des abonnés (avec notification email, une fois configurée)

Le site vitrine (GitHub Pages) appelle cette API en JavaScript (fetch),
depuis un autre domaine — d'où la configuration CORS ci-dessous.
"""
import os
import re
import uuid
from datetime import timedelta
from functools import wraps
from urllib.parse import urlparse

from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename

from models import db, Admin, Post, Subscriber
from emailer import notify_admin_new_subscriber, confirm_subscription
from emailer import notify_admin_new_membership

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^[+\d][\d\s.\-()]{5,25}$")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg", "gif", "webp",          # images
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",  # documents
    "mp4", "webm", "mov",                          # vidéos uploadées directement
}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 Mo par fichier

# Origines autorisées à appeler cette API (site GitHub Pages + dev local).
# Complétables sans toucher au code via la variable d'environnement EXTRA_ORIGINS
# (liste séparée par des virgules, ex. "https://unjedbenin.org,https://www.unjedbenin.org").
ALLOWED_ORIGINS = [
    "https://sedod.github.io",
    "https://theophiledounon-dotcom.github.io",
    "http://127.0.0.1:5500",   # pratique pour tester le site en local (Live Server)
    "http://localhost:5500",
]
_extra = os.environ.get("EXTRA_ORIGINS", "")
if _extra.strip():
    ALLOWED_ORIGINS += [o.strip() for o in _extra.split(",") if o.strip()]

app = Flask(__name__)
_secret = os.environ.get("SECRET_KEY", "")
if not _secret or _secret == "change-moi-avec-une-vraie-cle-secrete":
    print("[WARN] SECRET_KEY non configurée : utilisez la variable d'environnement SECRET_KEY en production.")
    _secret = "dev-only-change-me"
app.config["SECRET_KEY"] = _secret
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'unjed.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Cookies de session cross-domain (backend Render/PythonAnywhere <-> frontend GitHub Pages).
# En local (http), mettre COOKIE_SECURE=0 pour que la session fonctionne sans HTTPS.
_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "1") != "0"
app.config["SESSION_COOKIE_SAMESITE"] = "None" if _COOKIE_SECURE else "Lax"
app.config["SESSION_COOKIE_SECURE"] = _COOKIE_SECURE  # nécessite HTTPS en production
app.config["SESSION_COOKIE_HTTPONLY"] = True
# Session admin courte : 12 h max (défaut Flask = 31 jours, trop long pour un back-office).
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=12)

db.init_app(app)
CORS(app, supports_credentials=True, origins=ALLOWED_ORIGINS)

# Anti-abus mutualisé (par IP). Stockage mémoire par défaut ; en multi-workers
# ou multi-instances, renseigner RATELIMIT_STORAGE_URI (ex. redis://...).
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[],
    storage_uri=os.environ.get("RATELIMIT_STORAGE_URI", "memory://"),
)


@app.errorhandler(429)
def _ratelimit_exceeded(e):
    return jsonify({"error": "Trop de requêtes, réessayez plus tard"}), 429


@app.after_request
def _security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "SAMEORIGIN"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    resp.headers.pop("Server", None)
    return resp


MAX_JSON_BYTES = 100_000  # les payloads JSON (adhésion, contact…) n'ont rien à faire au-delà


def require_json():
    """Exige application/json : rend les endpoints insensibles au CSRF par
    formulaire HTML classique (un <form> tiers ne peut pas poser ce Content-Type
    sans preflight, que la CORS allowlist bloque)."""
    ctype = (request.content_type or "").split(";")[0].strip().lower()
    if ctype != "application/json":
        return jsonify({"error": "Content-Type application/json requis"}), 415
    if (request.content_length or 0) > MAX_JSON_BYTES:
        return jsonify({"error": "Requête trop volumineuse"}), 413
    return None


def _origin_allowed() -> bool:
    """Vérifie Origin/Referer pour les actions authentifiées.
    Indispensable car SameSite=None (requis par le front cross-domain) laisse
    passer les cookies lors de requêtes cross-site."""
    origin = request.headers.get("Origin") or request.headers.get("Referer") or ""
    if not origin:
        return True  # pas de contexte navigateur (curl, tests) : la session reste exigée
    try:
        host = urlparse(origin).netloc.lower()
    except Exception:
        return False
    allowed_hosts = {urlparse(o).netloc.lower() for o in ALLOWED_ORIGINS if "://" in o}
    return host in allowed_hosts


def verified_origin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if session.get("admin_id") and not _origin_allowed():
            return jsonify({"error": "Origine non autorisée"}), 403
        return view(*args, **kwargs)
    return wrapped


def _valid_external_url(value):
    """N'accepte que http(s) : bloque les javascript:/data: stockés puis
    réinjectés en href côté admin (XSS stockée)."""
    value = (value or "").strip()
    if not value:
        return None
    if len(value) > 500:
        return None
    try:
        parts = urlparse(value)
    except Exception:
        return None
    if parts.scheme.lower() not in {"http", "https"} or not parts.netloc:
        return None
    return value


# ---------------------------------------------------------------------------
# Authentification
# ---------------------------------------------------------------------------
def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin_id"):
            return jsonify({"error": "Non authentifié"}), 401
        return view(*args, **kwargs)
    return wrapped


@app.post("/api/admin/login")
@limiter.limit("15 per 15 minutes")
def admin_login():
    guard = require_json()
    if guard:
        return guard
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    admin = Admin.query.filter_by(username=username).first()
    if not admin or not admin.check_password(password):
        return jsonify({"error": "Identifiants incorrects"}), 401

    session["admin_id"] = admin.id
    session.permanent = True
    return jsonify({"ok": True, "admin": admin.to_dict()})


@app.post("/api/admin/logout")
@verified_origin
def admin_logout():
    session.pop("admin_id", None)
    return jsonify({"ok": True})


@app.get("/api/admin/me")
def admin_me():
    admin_id = session.get("admin_id")
    if not admin_id:
        return jsonify({"admin": None})
    admin = db.session.get(Admin, admin_id)
    return jsonify({"admin": admin.to_dict() if admin else None})


# ---------------------------------------------------------------------------
# Publications (annonces / documents / liens / images / vidéos)
# ---------------------------------------------------------------------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/api/posts")
def list_posts():
    """
    Liste des publications.
    - ?visibility=public  -> uniquement le contenu public (pour le site, ex. actualités)
    - sans authentification admin, jamais renvoyer le contenu "members"
    """
    visibility = request.args.get("visibility")
    query = Post.query.order_by(Post.created_at.desc())

    if session.get("admin_id"):
        # Un admin connecté peut tout voir (utile pour gérer l'espace admin)
        if visibility:
            query = query.filter_by(visibility=visibility)
    else:
        # Public : uniquement le contenu public, quoi qu'il arrive
        query = query.filter_by(visibility="public")

    posts = query.limit(100).all()
    return jsonify([p.to_dict() for p in posts])


@app.post("/api/posts")
@login_required
@verified_origin
def create_post():
    title = (request.form.get("title") or "").strip()
    body = request.form.get("body") or ""
    post_type = request.form.get("post_type") or "announcement"
    visibility = request.form.get("visibility") or "members"
    raw_url = (request.form.get("external_url") or "").strip()

    if not title:
        return jsonify({"error": "Le titre est obligatoire"}), 400
    if len(title) > 200 or len(body) > 20000:
        return jsonify({"error": "Titre ou contenu trop long"}), 400
    if post_type not in {"announcement", "document", "link", "image", "video"}:
        return jsonify({"error": "Type de publication invalide"}), 400
    if visibility not in {"public", "members"}:
        return jsonify({"error": "Visibilité invalide"}), 400
    external_url = _valid_external_url(raw_url)
    if raw_url and not external_url:
        return jsonify({"error": "URL externe invalide (http/https requis)"}), 400

    file_url = None
    original_filename = None
    uploaded_file = request.files.get("file")
    if uploaded_file and uploaded_file.filename:
        if not allowed_file(uploaded_file.filename):
            return jsonify({"error": "Type de fichier non autorisé"}), 400
        original_filename = secure_filename(uploaded_file.filename)[:200]
        ext = uploaded_file.filename.rsplit(".", 1)[1].lower()
        stored_name = f"{uuid.uuid4().hex}.{ext}"
        uploaded_file.save(os.path.join(UPLOAD_DIR, stored_name))
        file_url = f"/static/uploads/{stored_name}"

    post = Post(
        title=title,
        body=body,
        post_type=post_type,
        visibility=visibility,
        file_url=file_url,
        original_filename=original_filename,
        external_url=external_url,
        author_id=session["admin_id"],
    )
    db.session.add(post)
    db.session.commit()
    return jsonify(post.to_dict()), 201


@app.delete("/api/posts/<int:post_id>")
@login_required
@verified_origin
def delete_post(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Introuvable"}), 404
    if post.file_url:
        file_path = os.path.join(BASE_DIR, post.file_url.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)
    db.session.delete(post)
    db.session.commit()
    return jsonify({"ok": True})


@app.get("/static/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_DIR, filename)


# ---------------------------------------------------------------------------
# Abonnés (newsletter / notifications)
# ---------------------------------------------------------------------------
@app.post("/api/subscribe")
@limiter.limit("20 per hour")
def subscribe():
    guard = require_json()
    if guard:
        return guard
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Email invalide"}), 400

    existing = Subscriber.query.filter_by(email=email).first()
    if existing:
        return jsonify({"ok": True, "already": True})

    sub = Subscriber(email=email)
    db.session.add(sub)
    db.session.commit()

    # Emails best-effort : n'empêchent jamais l'inscription de réussir
    notify_admin_new_subscriber(email)
    confirm_subscription(email)

    return jsonify({"ok": True, "already": False})


@app.get("/api/admin/subscribers")
@login_required
def list_subscribers():
    subs = Subscriber.query.order_by(Subscriber.created_at.desc()).all()
    return jsonify([s.to_dict() for s in subs])

from flask import send_file
from models import Member, ContactMessage

# Endpoint pour enregistrer les adhésions
@app.post("/api/adhesion")
@limiter.limit("10 per hour")
def submit_adhesion():
    guard = require_json()
    if guard:
        return guard
    data = request.get_json(silent=True) or {}
    if (data.get("company") or "").strip():
        # Honeypot anti-spam : faux succès, rien n'est stocké.
        return jsonify({"ok": True, "message": "Adhésion enregistrée avec succès"}), 201
    country = (data.get("country") or "").strip()
    if country == "Autre":
        country = (data.get("country_other") or "").strip() or "Autre"

    full_name = (data.get("fullname") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()

    if not full_name or not email or not phone:
        return jsonify({"error": "Nom, email et téléphone obligatoires"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Email invalide"}), 400
    if not PHONE_RE.match(phone):
        return jsonify({"error": "Numéro de téléphone invalide"}), 400
    if len(full_name) > 150 or len(email) > 150 or len(phone) > 50:
        return jsonify({"error": "Champs trop longs"}), 400

    member = Member(
        member_type=(data.get("member_type") or "Personne physique")[:50],
        full_name=full_name,
        email=email,
        phone=phone,
        country=(country or "Bénin")[:100],
        dept_or_region=(data.get("dept") if country == "Bénin" else data.get("region") or "")[:100],
        profile=((data.get("profile_other") if data.get("profile") == "Autre" else data.get("profile")) or "")[:100],
        motivation=(data.get("motivation") or "")[:2000],
    )
    db.session.add(member)
    db.session.commit()
    notify_admin_new_membership(full_name, email)
    return jsonify({"ok": True, "message": "Adhésion enregistrée avec succès"}), 201


# Endpoint pour enregistrer les messages de contact
@app.post("/api/contact")
@limiter.limit("10 per hour")
def submit_contact():
    guard = require_json()
    if guard:
        return guard
    data = request.get_json(silent=True) or {}
    if (data.get("company") or "").strip():
        # Honeypot anti-spam : faux succès, rien n'est stocké.
        return jsonify({"ok": True, "message": "Message reçu, merci !"}), 201
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    message = (data.get("message") or "").strip()
    phone = (data.get("phone") or "").strip()[:50]
    subject = (data.get("subject") or "").strip()[:200]

    if not name or not email or not message:
        return jsonify({"error": "Nom, email et message obligatoires"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"error": "Email invalide"}), 400
    if len(name) > 150 or len(message) > 5000:
        return jsonify({"error": "Champs trop longs"}), 400

    msg = ContactMessage(name=name[:150], email=email, phone=phone,
                         subject=subject, message=message)
    db.session.add(msg)
    db.session.commit()
    return jsonify({"ok": True, "message": "Message reçu, merci !"}), 201


@app.get("/api/admin/members")
@login_required
def list_members():
    members = Member.query.order_by(Member.created_at.desc()).limit(500).all()
    return jsonify([m.to_dict() for m in members])


@app.get("/api/admin/messages")
@login_required
def list_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).limit(500).all()
    return jsonify([m.to_dict() for m in messages])


# Endpoint pour télécharger directement une décision ou annonce en PDF
@app.get("/api/posts/download/<int:post_id>")
def download_post_pdf(post_id):
    post = db.session.get(Post, post_id)
    if not post or not post.file_url:
        return jsonify({"error": "Fichier introuvable"}), 404
    # Un fichier "members" n'est téléchargeable que par un admin connecté.
    # On répond 404 (et non 401/403) pour ne pas révéler son existence.
    if post.visibility != "public" and not session.get("admin_id"):
        return jsonify({"error": "Fichier introuvable"}), 404

    file_path = os.path.join(BASE_DIR, post.file_url.lstrip("/"))
    if not os.path.exists(file_path):
        return jsonify({"error": "Fichier introuvable"}), 404
    return send_file(
        file_path,
        as_attachment=True,
        download_name=post.original_filename or f"Decision_UNJED_{post.id}.pdf"
    )



# ---------------------------------------------------------------------------
# Emplacement réservé : PAIEMENT ADHESION (FedaPay / Kkiapay)
# ---------------------------------------------------------------------------
# A implémenter une fois le compte marchand créé. Le flux prévu :
#   1. POST /api/adhesion/initier  -> crée la demande en base (statut "en_attente")
#                                     + appelle l'API FedaPay/Kkiapay pour générer
#                                     un lien de paiement, renvoyé au frontend.
#   2. Le membre paie sur la page FedaPay/Kkiapay.
#   3. FedaPay/Kkiapay appelle notre webhook POST /api/adhesion/webhook
#      pour confirmer le paiement -> on passe le statut à "payé" et on envoie
#      les 2 emails (confirmation membre + notification admin).
#
# @app.post("/api/adhesion/initier")
# def initier_adhesion(): ...
#
# @app.post("/api/adhesion/webhook")
# def webhook_paiement(): ...


# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "version": "1.2.0"})


@app.get("/api/config")
def public_config():
    """Petite config publique utile au frontend (pas de secrets)."""
    return jsonify({"org": "UNJED-BENIN", "contact_email": "unjedbenin@gmail.com"})


with app.app_context():
    db.create_all()
    # Bootstrap admin UNIQUEMENT via variables d'environnement (jamais de mot de passe en dur).
    # Ex. sur Render : ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_DISPLAY_NAME.
    _env_user = os.environ.get("ADMIN_USERNAME", "").strip()
    _env_pass = os.environ.get("ADMIN_PASSWORD", "")
    _env_display = os.environ.get("ADMIN_DISPLAY_NAME", _env_user or "UNJED-BENIN")
    if _env_user and _env_pass:
        if not Admin.query.filter_by(username=_env_user).first():
            admin = Admin(username=_env_user, display_name=_env_display)
            admin.set_password(_env_pass)
            db.session.add(admin)
            db.session.commit()
            print("Compte administrateur créé depuis les variables d'environnement.")
    else:
        print("[INFO] Aucun admin créé : définissez ADMIN_USERNAME + ADMIN_PASSWORD (voir .env.example).")

