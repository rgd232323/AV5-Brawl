from config import *
import services.brawler as brawler_service


def _erro_brawler(error):
    if isinstance(error, brawler_service.BrawlerValidationError):
        status = 400
    elif isinstance(error, brawler_service.BrawlerNotFoundError):
        status = 404
    elif isinstance(error, brawler_service.BrawlerConflictError):
        status = 409
    else:
        status = 500

    return jsonify({"resultado": "erro", "detalhes": str(error)}), status


@app.route("/brawlers", methods=["GET"])
def retornar_brawlers():
    try:
        brawlers = brawler_service.retornar_brawlers(request.args.to_dict())
    except (
        brawler_service.BrawlerValidationError,
        brawler_service.BrawlerPersistenceError,
    ) as error:
        return _erro_brawler(error)

    return jsonify({
        "resultado": "ok",
        "detalhes": [brawler.json() for brawler in brawlers],
    })


@app.route("/brawlers/<int:brawler_id>", methods=["GET"])
def obter_brawler(brawler_id):
    try:
        brawler = brawler_service.obter_brawler(brawler_id)
    except (
        brawler_service.BrawlerNotFoundError,
        brawler_service.BrawlerPersistenceError,
    ) as error:
        return _erro_brawler(error)

    return jsonify({"resultado": "ok", "detalhes": brawler.json()})


@app.route("/brawlers", methods=["POST"])
@jwt_required()
def adicionar_brawler():
    try:
        brawler = brawler_service.adicionar_brawler(request.get_json(silent=True))
    except (
        brawler_service.BrawlerValidationError,
        brawler_service.BrawlerConflictError,
        brawler_service.BrawlerPersistenceError,
    ) as error:
        return _erro_brawler(error)

    return jsonify({"resultado": "ok", "detalhes": brawler.json()}), 201


@app.route("/brawlers/<int:brawler_id>", methods=["PUT", "PATCH"])
@jwt_required()
def atualizar_brawler(brawler_id):
    try:
        brawler = brawler_service.atualizar_brawler(
            brawler_id,
            request.get_json(silent=True),
            partial=request.method == "PATCH",
        )
    except (
        brawler_service.BrawlerValidationError,
        brawler_service.BrawlerNotFoundError,
        brawler_service.BrawlerConflictError,
        brawler_service.BrawlerPersistenceError,
    ) as error:
        return _erro_brawler(error)

    return jsonify({"resultado": "ok", "detalhes": brawler.json()})


@app.route("/brawlers/<int:brawler_id>", methods=["DELETE"])
@jwt_required()
def excluir_brawler(brawler_id):
    try:
        brawler_service.excluir_brawler(brawler_id)
    except (
        brawler_service.BrawlerNotFoundError,
        brawler_service.BrawlerConflictError,
        brawler_service.BrawlerPersistenceError,
    ) as error:
        return _erro_brawler(error)

    return jsonify({"resultado": "ok", "detalhes": "Brawler excluído com sucesso"})
