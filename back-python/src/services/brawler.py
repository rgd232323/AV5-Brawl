from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from config import db
from models.brawlers import Brawler


FIELDS = ("nome", "classe", "velocidade", "descricao")


class BrawlerValidationError(ValueError):
    pass


class BrawlerNotFoundError(LookupError):
    pass


class BrawlerConflictError(ValueError):
    pass


class BrawlerPersistenceError(RuntimeError):
    pass


def _validated_fields(data, partial=False):
    if not isinstance(data, dict):
        raise BrawlerValidationError("O corpo da requisição deve ser um objeto JSON")

    unknown_fields = set(data) - set(FIELDS)
    if unknown_fields:
        raise BrawlerValidationError(
            f"Campos não permitidos: {', '.join(sorted(unknown_fields))}"
        )

    if not partial:
        missing_fields = [field for field in FIELDS if field not in data]
        if missing_fields:
            raise BrawlerValidationError(
                f"Campos obrigatórios: {', '.join(missing_fields)}"
            )
    elif not data:
        raise BrawlerValidationError("Informe ao menos um campo para atualizar")

    validated = {}
    for field, value in data.items():
        if not isinstance(value, str):
            raise BrawlerValidationError(f"O campo {field} deve ser um texto")
        value = value.strip()
        if not value:
            raise BrawlerValidationError(f"O campo {field} não pode ficar vazio")
        if len(value) > 200:
            raise BrawlerValidationError(
                f"O campo {field} deve ter no máximo 200 caracteres"
            )
        validated[field] = value

    return validated


def _check_duplicate_name(nome, exclude_id=None):
    try:
        query = Brawler.query.filter(func.lower(Brawler.nome) == nome.lower())
        if exclude_id is not None:
            query = query.filter(Brawler.id != exclude_id)
        if query.first():
            raise BrawlerConflictError("Já existe um brawler com esse nome")
    except SQLAlchemyError as error:
        raise BrawlerPersistenceError("Não foi possível consultar os brawlers") from error


def _commit():
    try:
        db.session.commit()
    except IntegrityError as error:
        db.session.rollback()
        raise BrawlerConflictError("Já existe um brawler com esses dados") from error
    except SQLAlchemyError as error:
        db.session.rollback()
        raise BrawlerPersistenceError("Não foi possível salvar o brawler") from error


def adicionar_brawler(data):
    fields = _validated_fields(data)
    _check_duplicate_name(fields["nome"])
    brawler = Brawler(**fields)
    db.session.add(brawler)
    _commit()
    return brawler


def retornar_brawlers(filters=None):
    filters = filters or {}
    unknown_filters = set(filters) - {"nome", "classe", "velocidade"}
    if unknown_filters:
        raise BrawlerValidationError(
            f"Filtros não permitidos: {', '.join(sorted(unknown_filters))}"
        )

    query = Brawler.query
    for field, value in filters.items():
        if not isinstance(value, str) or len(value) > 200:
            raise BrawlerValidationError(f"Filtro inválido: {field}")
        value = value.strip()
        if value:
            column = getattr(Brawler, field)
            query = query.filter(column.ilike(f"%{value}%"))

    try:
        return query.order_by(Brawler.id).all()
    except SQLAlchemyError as error:
        raise BrawlerPersistenceError("Não foi possível consultar os brawlers") from error


def obter_brawler(brawler_id):
    try:
        brawler = db.session.get(Brawler, brawler_id)
    except SQLAlchemyError as error:
        raise BrawlerPersistenceError("Não foi possível consultar o brawler") from error
    if brawler is None:
        raise BrawlerNotFoundError("Brawler não encontrado")
    return brawler


def atualizar_brawler(brawler_id, data, partial=False):
    brawler = obter_brawler(brawler_id)
    fields = _validated_fields(data, partial=partial)
    if "nome" in fields:
        _check_duplicate_name(fields["nome"], exclude_id=brawler.id)

    for field, value in fields.items():
        setattr(brawler, field, value)
    _commit()
    return brawler


def excluir_brawler(brawler_id):
    brawler = obter_brawler(brawler_id)
    db.session.delete(brawler)
    _commit()
