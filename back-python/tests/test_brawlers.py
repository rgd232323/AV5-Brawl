import os
import sys
import unittest
from pathlib import Path


os.environ.pop("POSTGRES_URL_NON_POOLING", None)
os.environ["DATABASE_URL"] = "sqlite://"

SRC = Path(__file__).resolve().parents[1] / "src"
sys.path.insert(0, str(SRC))

from app import app
from config import db
from flask_jwt_extended import create_access_token
from models.pessoa import Pessoa
import bcrypt



class BrawlerRoutesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with app.app_context():
            app.config["TESTING"] = True
            db.create_all()
            cls.token = create_access_token(identity="test-user")

    @classmethod
    def tearDownClass(cls):
        with app.app_context():
            db.drop_all()
            db.session.remove()

    def setUp(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()
            db.create_all()
        self.client = app.test_client()
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.payload = {
            "nome": "Shelly",
            "classe": "Dano",
            "velocidade": "Normal",
            "descricao": "Brawler inicial",
        }

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def criar_brawler(self, payload=None):
        return self.client.post(
            "/brawlers",
            json=payload or self.payload,
            headers=self.headers,
        )

    def test_create_list_filter_and_get_by_id(self):
        response = self.criar_brawler()
        self.assertEqual(response.status_code, 201)
        brawler_id = response.json["detalhes"]["id"]

        listing = self.client.get("/brawlers?classe=dano")
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json["detalhes"]), 1)
        self.assertEqual(listing.json["detalhes"][0]["nome"], "Shelly")

        detail = self.client.get(f"/brawlers/{brawler_id}")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.json["detalhes"]["id"], brawler_id)

    def test_update_and_delete(self):
        brawler_id = self.criar_brawler().json["detalhes"]["id"]

        updated = self.client.put(
            f"/brawlers/{brawler_id}",
            json={
                "nome": "Shelly",
                "classe": "Dano",
                "velocidade": "Rápida",
                "descricao": "Descrição atualizada",
            },
            headers=self.headers,
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json["detalhes"]["velocidade"], "Rápida")

        patched = self.client.patch(
            f"/brawlers/{brawler_id}",
            json={"descricao": "Atualização parcial"},
            headers=self.headers,
        )
        self.assertEqual(patched.status_code, 200)
        self.assertEqual(patched.json["detalhes"]["descricao"], "Atualização parcial")

        deleted = self.client.delete(
            f"/brawlers/{brawler_id}",
            headers=self.headers,
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(self.client.get(f"/brawlers/{brawler_id}").status_code, 404)

    def test_validation_duplicates_and_missing_records(self):
        missing_field_payload = dict(self.payload)
        del missing_field_payload["descricao"]
        invalid = self.criar_brawler(missing_field_payload)
        self.assertEqual(invalid.status_code, 400)

        created = self.criar_brawler()
        self.assertEqual(created.status_code, 201)

        duplicate_payload = dict(self.payload, nome="sHeLlY")
        duplicate = self.criar_brawler(duplicate_payload)
        self.assertEqual(duplicate.status_code, 409)

        missing = self.client.get("/brawlers/999")
        self.assertEqual(missing.status_code, 404)

        brawler_id = created.json["detalhes"]["id"]
        invalid_patch = self.client.patch(
            f"/brawlers/{brawler_id}",
            json={"descricao": " ", "campo_extra": "inválido"},
            headers=self.headers,
        )
        self.assertEqual(invalid_patch.status_code, 400)
        current = self.client.get(f"/brawlers/{brawler_id}")
        self.assertEqual(current.json["detalhes"]["descricao"], "Brawler inicial")

    def test_mutations_require_authentication(self):
        response = self.client.post("/brawlers", json=self.payload)
        self.assertEqual(response.status_code, 401)

    def test_default_admin_login_is_idempotent_and_password_is_not_exposed(self):
        first_initialization = self.client.get("/criar_banco")
        second_initialization = self.client.get("/criar_banco")
        self.assertEqual(first_initialization.status_code, 200)
        self.assertEqual(second_initialization.status_code, 200)
        with app.app_context():
            admins = Pessoa.query.filter_by(login="admin").all()
            self.assertEqual(len(admins), 1)
            self.assertTrue(
                bcrypt.checkpw(b"admin123", admins[0].senha.encode("utf-8"))
            )

        login = self.client.post(
            "/login",
            json={"login": "admin", "senha": "admin123"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("token", login.json["detalhes"])

        incorrect_login = self.client.post(
            "/login",
            json={"login": "admin", "senha": "incorreta"},
        )
        self.assertEqual(incorrect_login.status_code, 401)

        people = self.client.get("/pessoas")
        self.assertEqual(people.status_code, 200)
        self.assertNotIn("senha", people.json["detalhes"][0])


if __name__ == "__main__":
    unittest.main()
