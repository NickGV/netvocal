from datetime import UTC, datetime
from uuid import uuid4


class ConversationStore:
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


_store = ConversationStore()


def get_conversation_store() -> ConversationStore:
    return _store
