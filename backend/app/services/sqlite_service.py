"""
SQLite Service — Lightweight session storage and audit logging.
"""

import os
import aiosqlite
import json
from datetime import datetime
from typing import Optional, List, Dict

from app.config import settings


class SQLiteService:
    """Async SQLite service for sessions and audit logs."""

    def __init__(self):
        self.db_path = settings.SQLITE_DB_PATH
        self._ensure_dir()

    def _ensure_dir(self):
        dir_name = os.path.dirname(os.path.abspath(self.db_path))
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

    async def initialize(self):
        """Create tables if they don't exist."""
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    messages TEXT NOT NULL DEFAULT '[]'
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    session_id TEXT,
                    query TEXT,
                    jurisdiction TEXT,
                    language TEXT,
                    response_confidence REAL,
                    citations_count INTEGER
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    message_id TEXT NOT NULL,
                    rating TEXT NOT NULL,
                    comment TEXT
                )
            """)
            await db.execute("""
                CREATE TABLE IF NOT EXISTS formulation_scenarios (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    ingredients TEXT NOT NULL DEFAULT '[]',
                    entity_type TEXT NOT NULL DEFAULT 'domestic',
                    herb_count INTEGER NOT NULL DEFAULT 0,
                    total_ratio REAL NOT NULL DEFAULT 0.0,
                    updated_at TEXT NOT NULL
                )
            """)
            await db.commit()

    async def log_query(
        self,
        session_id: str,
        query: str,
        jurisdiction: str,
        language: str,
        confidence: float,
        citations_count: int,
    ):
        """Log a query to the audit trail."""
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    session_id TEXT,
                    query TEXT,
                    jurisdiction TEXT,
                    language TEXT,
                    response_confidence REAL,
                    citations_count INTEGER
                )
            """)
            await db.execute(
                """INSERT INTO audit_log 
                   (timestamp, session_id, query, jurisdiction, language, response_confidence, citations_count)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (datetime.utcnow().isoformat(), session_id, query, jurisdiction, language, confidence, citations_count),
            )
            await db.commit()

    async def save_feedback(self, message_id: str, rating: str, comment: Optional[str] = None):
        """Save user feedback."""
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    message_id TEXT NOT NULL,
                    rating TEXT NOT NULL,
                    comment TEXT
                )
            """)
            await db.execute(
                "INSERT INTO feedback (timestamp, message_id, rating, comment) VALUES (?, ?, ?, ?)",
                (datetime.utcnow().isoformat(), message_id, rating, comment),
            )
            await db.commit()

    async def save_scenario(
        self,
        scenario_id: str,
        title: str,
        ingredients: List[Dict],
        entity_type: str,
    ):
        """Upsert a working Formulation Lab scenario (autosave, §14.7)."""
        self._ensure_dir()
        total = round(sum(float(i.get("ratio", 0.0)) for i in ingredients), 2)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS formulation_scenarios (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    ingredients TEXT NOT NULL DEFAULT '[]',
                    entity_type TEXT NOT NULL DEFAULT 'domestic',
                    herb_count INTEGER NOT NULL DEFAULT 0,
                    total_ratio REAL NOT NULL DEFAULT 0.0,
                    updated_at TEXT NOT NULL
                )
            """)
            await db.execute(
                """INSERT INTO formulation_scenarios
                       (id, title, ingredients, entity_type, herb_count, total_ratio, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(id) DO UPDATE SET
                       title=excluded.title,
                       ingredients=excluded.ingredients,
                       entity_type=excluded.entity_type,
                       herb_count=excluded.herb_count,
                       total_ratio=excluded.total_ratio,
                       updated_at=excluded.updated_at""",
                (
                    scenario_id,
                    title,
                    json.dumps(ingredients),
                    entity_type,
                    len(ingredients),
                    total,
                    datetime.utcnow().isoformat(),
                ),
            )
            await db.commit()

    async def list_scenarios(self, limit: int = 12) -> List[Dict]:
        """Most-recently-updated scenarios for 'Continue recent work'."""
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS formulation_scenarios (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    ingredients TEXT NOT NULL DEFAULT '[]',
                    entity_type TEXT NOT NULL DEFAULT 'domestic',
                    herb_count INTEGER NOT NULL DEFAULT 0,
                    total_ratio REAL NOT NULL DEFAULT 0.0,
                    updated_at TEXT NOT NULL
                )
            """)
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, title, entity_type, herb_count, total_ratio, updated_at "
                "FROM formulation_scenarios ORDER BY updated_at DESC LIMIT ?",
                (limit,),
            )
            return [dict(row) for row in await cursor.fetchall()]

    async def get_scenario(self, scenario_id: str) -> Optional[Dict]:
        """Full restore payload for one scenario."""
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, title, ingredients, entity_type, updated_at "
                "FROM formulation_scenarios WHERE id = ?",
                (scenario_id,),
            )
            row = await cursor.fetchone()
            if row is None:
                return None
            data = dict(row)
            data["ingredients"] = json.loads(data["ingredients"])
            return data

    async def delete_scenario(self, scenario_id: str) -> bool:
        self._ensure_dir()
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "DELETE FROM formulation_scenarios WHERE id = ?", (scenario_id,)
            )
            await db.commit()
            return cursor.rowcount > 0


# Singleton instance
sqlite_service = SQLiteService()
