from fastapi import APIRouter

from app.api.v1.endpoints import (
    compare,
    parties,
    politicians,
    propositions,
    stats,
    transparency,
    votes,
)

router = APIRouter()
router.include_router(politicians.router)
router.include_router(parties.router)
router.include_router(propositions.router)
router.include_router(votes.router)
router.include_router(compare.router)
router.include_router(transparency.router)
router.include_router(stats.router)
