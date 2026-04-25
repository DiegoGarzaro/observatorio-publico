from pydantic import BaseModel, ConfigDict


class PartyResponse(BaseModel):
    """Party response schema.

    Attributes:
        id (int): Internal party ID.
        abbreviation (str): Party acronym.
        name (str): Full party name.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    abbreviation: str
    name: str
