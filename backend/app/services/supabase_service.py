"""
Supabase Service — Relational Database and Authentication via Supabase.
"""

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
            print(f"Error saving session: {e}")

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
            print(f"Error saving message: {e}")

supabase_service = SupabaseService()
