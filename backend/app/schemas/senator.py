from pydantic import BaseModel


class SenatorCommittee(BaseModel):
    """A committee the senator is currently a member of.

    Attributes:
        name (str): Full committee name.
        abbreviation (str | None): Committee abbreviation (e.g. CAS, CCJ).
        role (str | None): Participation role (e.g. Titular, Suplente, Presidente).
    """

    name: str
    abbreviation: str | None = None
    role: str | None = None


class SenatorMandate(BaseModel):
    """A single senate mandate (8-year term).

    Attributes:
        legislature (int): Starting legislature number.
        uf (str | None): State represented.
        party (str | None): Party at the time of the mandate.
        start_year (int | None): First year of the mandate.
        end_year (int | None): Last year of the mandate.
    """

    legislature: int
    uf: str | None = None
    party: str | None = None
    start_year: int | None = None
    end_year: int | None = None


class SenatorDetailResponse(BaseModel):
    """Extended senator profile fetched live from the Senado API.

    Attributes:
        website (str | None): Official senator website URL.
        birth_date (str | None): Date of birth in YYYY-MM-DD format.
        gender (str | None): Gender as returned by the API.
        committees (list[SenatorCommittee]): Active committee memberships.
        mandates (list[SenatorMandate]): Full mandate history, oldest first.
    """

    website: str | None = None
    birth_date: str | None = None
    gender: str | None = None
    committees: list[SenatorCommittee] = []
    mandates: list[SenatorMandate] = []
