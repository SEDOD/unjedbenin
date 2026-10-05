"""
Script à lancer UNE FOIS sur le serveur (console Bash PythonAnywhere) pour
créer ou mettre à jour les comptes administrateurs.

Usage :
    python3 seed_admins.py

Les mots de passe sont saisis au clavier (jamais écrits dans un fichier),
puis stockés hashés (jamais en clair) dans la base de données.
"""
import getpass
from app import app
from models import db, Admin


def upsert_admin(username, display_name, password):
    admin = Admin.query.filter_by(username=username).first()
    if admin:
        admin.display_name = display_name
        admin.set_password(password)
        print(f"  -> compte '{username}' mis à jour.")
    else:
        admin = Admin(username=username, display_name=display_name)
        admin.set_password(password)
        db.session.add(admin)
        print(f"  -> compte '{username}' créé.")
    db.session.commit()


def main():
    with app.app_context():
        db.create_all()
        print("Création / mise à jour des comptes administrateurs UNJED-BENIN")
        print("(laisser le nom d'utilisateur vide pour arrêter)\n")
        while True:
            username = input("Nom d'utilisateur (ex: theophile) : ").strip()
            if not username:
                break
            display_name = input("Nom affiché (ex: Théophile) : ").strip() or username
            password = getpass.getpass("Mot de passe : ")
            confirm = getpass.getpass("Confirmer le mot de passe : ")
            if password != confirm:
                print("  ! Les mots de passe ne correspondent pas, recommence.\n")
                continue
            if len(password) < 6:
                print("  ! Mot de passe trop court (6 caractères minimum), recommence.\n")
                continue
            upsert_admin(username, display_name, password)
            print()
        print("Terminé.")


if __name__ == "__main__":
    main()
