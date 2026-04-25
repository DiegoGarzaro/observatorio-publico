class NotFoundError(Exception):
    """Raised when a requested resource does not exist.

    Args:
        entity (str): Entity type name (e.g. 'Politician').
        entity_id (int | str): Identifier that was not found.
    """

    def __init__(self, entity: str, entity_id: int | str) -> None:
        self.entity = entity
        self.entity_id = entity_id
        super().__init__(f"{entity} with id={entity_id} not found")


class PoliticianNotFoundError(NotFoundError):
    def __init__(self, politician_id: int) -> None:
        super().__init__("Politician", politician_id)
