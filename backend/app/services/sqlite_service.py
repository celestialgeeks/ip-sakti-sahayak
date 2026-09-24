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


# Singleton instance
sqlite_service = SQLiteService()
