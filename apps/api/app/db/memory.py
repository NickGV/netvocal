from app.db.sqlite_store import ConversationStore, SQLiteConversationStore

# Use SQLite for persistent storage
_store = SQLiteConversationStore()


def get_conversation_store() -> ConversationStore:
    return _store
