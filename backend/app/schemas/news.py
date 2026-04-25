from datetime import datetime

from pydantic import BaseModel


class NewsItem(BaseModel):
    """A single news article.

    Attributes:
        title (str): Article headline.
        url (str): Direct link to the article.
        source (str): Publisher name (e.g. "G1", "Folha de S.Paulo").
        published_at (datetime | None): Publication timestamp in UTC.
    """

    title: str
    url: str
    source: str
    published_at: datetime | None = None


class NewsResponse(BaseModel):
    """List of recent news articles for a politician.

    Attributes:
        items (list[NewsItem]): Up to 5 most recent articles.
        politician_name (str): Name used for the news query.
        cached (bool): Whether the result was served from cache.
        cached_at (datetime | None): Timestamp of the last cache write (UTC).
    """

    items: list[NewsItem]
    politician_name: str
    cached: bool
    cached_at: datetime | None = None
