"""
Supabase Service — Relational Database and Authentication via Supabase.
"""

import logging

logger = logging.getLogger("app.supabase_service")

from supabase import create_client, Client
from typing import Optional, List, Dict
import os
import json
import uuid
from datetime import datetime

from app.config import settings

class SupabaseService:
    def __init__(self):
        url: str = settings.NEXT_PUBLIC_SUPABASE_URL
        key: str = settings.SUPABASE_SERVICE_ROLE_KEY
        if url and key:
            self.client: Client = create_client(url, key)
        else:
            self.client = None

    async def save_session(self, session_id: str, user_id: str, title: str):
        """Save a new chat session."""
        if not self.client:
            return
        
        try:
            # Check if exists
            existing = self.client.table("chat_sessions").select("id").eq("id", session_id).execute()
            if not existing.data:
                self.client.table("chat_sessions").insert({
                    "id": session_id,
                    "user_id": user_id,
                    "title": title
                }).execute()
        except Exception as e:
            logger.info("Error saving session: {e}")

    async def save_message(self, session_id: str, role: str, content: str, citations: Optional[List[Dict]] = None):
        """Save a message to a session."""
        if not self.client:
            return
        
        try:
            self.client.table("chat_messages").insert({
                "session_id": session_id,
                "role": role,
                "content": content,
                "citations": citations if citations else None
            }).execute()
        except Exception as e:
            logger.info("Error saving message: {e}")

    # ── Registration & Compliance Wizard ──────────────────────────────

    async def get_wizard_state(self, user_id: str) -> Optional[Dict]:
        """Fetch a user's persisted wizard progress, or None if absent."""
        if not self.client:
            return None

        try:
            res = self.client.table("wizard_states").select("*").eq("user_id", user_id).limit(1).execute()
            if res.data:
                row = res.data[0]
                return {
                    "current_step": row.get("current_step") or "eligibility",
                    "product_type": row.get("product_type"),
                    "classification": row.get("classification"),
                    "steps": row.get("steps") or [],
                    "answers": row.get("answers"),
                    "updated_at": row.get("updated_at"),
                }
            return None
        except Exception as e:
            logger.info("Error loading wizard state: %s", e)
            return None

    async def save_wizard_state(self, user_id: str, payload: Dict) -> Dict:
        """Upsert a user's wizard progress and return the stored shape."""
        base = {
            "current_step": payload.get("current_step") or "eligibility",
            "product_type": payload.get("product_type"),
            "classification": payload.get("classification"),
            "steps": payload.get("steps") or [],
            "answers": payload.get("answers"),
        }
        if not self.client:
            return {**base, "updated_at": None}

        try:
            row = {"user_id": user_id, **base}
            res = self.client.table("wizard_states").upsert(row, on_conflict="user_id").execute()
            data = res.data[0] if res.data else row
            return {
                "current_step": data.get("current_step") or "eligibility",
                "product_type": data.get("product_type"),
                "classification": data.get("classification"),
                "steps": data.get("steps") or [],
                "answers": data.get("answers"),
                "updated_at": data.get("updated_at"),
            }
        except Exception as e:
            logger.info("Error saving wizard state: %s", e)
            return {**base, "updated_at": None}

supabase_service = SupabaseService()
