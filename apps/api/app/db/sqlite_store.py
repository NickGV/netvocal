import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4


class ConversationStore:
    """Abstract interface for conversation storage."""

    def create_session(self) -> str:
        raise NotImplementedError

    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        raise NotImplementedError

    def get_history(self, session_id: str) -> list[dict]:
        raise NotImplementedError


class MemoryConversationStore(ConversationStore):
    """In-memory implementation for testing."""

    def __init__(self) -> None:
        self._store: dict[str, list[dict]] = {}

    def create_session(self) -> str:
        session_id = uuid4().hex[:12]
        self._store[session_id] = []
        return session_id

    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        now = datetime.now(UTC).isoformat()
        if session_id not in self._store:
            self._store[session_id] = []
        self._store[session_id].append({"role": "user", "text": user_text, "timestamp": now})
        self._store[session_id].append({"role": "assistant", "text": assistant_text, "timestamp": now})

    def get_history(self, session_id: str) -> list[dict]:
        return self._store.get(session_id, [])


class SQLiteConversationStore(ConversationStore):
    """SQLite-based persistent implementation."""

    def __init__(self, db_path: str | None = None) -> None:
        if db_path is None:
            db_path = "conversation_history.db"
        
        self.db_path = db_path
        self._conn: sqlite3.Connection | None = None
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Get or create database connection."""
        if self._conn is None:
            self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        return self._conn

    def _init_db(self) -> None:
        """Initialize database schema if not exists."""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS turns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES conversations(session_id)
                    ON DELETE CASCADE
            )
        """)
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_turns_session_id ON turns(session_id)"
        )
        conn.commit()

    def create_session(self) -> str:
        session_id = uuid4().hex[:12]
        now = datetime.now(UTC).isoformat()
        
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO conversations (session_id, created_at, updated_at) VALUES (?, ?, ?)",
            (session_id, now, now)
        )
        conn.commit()
        
        return session_id

    def add_turn(self, session_id: str, user_text: str, assistant_text: str) -> None:
        now = datetime.now(UTC).isoformat()
        
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # Ensure session exists
        cursor.execute(
            "SELECT session_id FROM conversations WHERE session_id = ?",
            (session_id,)
        )
        if cursor.fetchone() is None:
            cursor.execute(
                "INSERT INTO conversations (session_id, created_at, updated_at) VALUES (?, ?, ?)",
                (session_id, now, now)
            )
        
        # Add user turn
        cursor.execute(
            "INSERT INTO turns (session_id, role, text, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, "user", user_text, now)
        )
        
        # Add assistant turn
        cursor.execute(
            "INSERT INTO turns (session_id, role, text, timestamp) VALUES (?, ?, ?, ?)",
            (session_id, "assistant", assistant_text, now)
        )
        
        # Update session timestamp
        cursor.execute(
            "UPDATE conversations SET updated_at = ? WHERE session_id = ?",
            (now, session_id)
        )
        
        conn.commit()

    def get_history(self, session_id: str) -> list[dict]:
        conn = self._get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, text, timestamp FROM turns WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

    def close(self) -> None:
        """Close database connection."""
        if self._conn is not None:
            self._conn.close()
            self._conn = None

