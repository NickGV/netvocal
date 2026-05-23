import pytest

from app.db.sqlite_store import SQLiteConversationStore


@pytest.fixture(autouse=True)
def clean_db():
    """Use in-memory SQLite database for tests."""
    # Create in-memory database for this test
    test_store = SQLiteConversationStore(":memory:")
    
    # Patch the global store
    import app.db.memory
    original_store = app.db.memory._store
    app.db.memory._store = test_store
    
    yield
    
    # Restore original store
    app.db.memory._store = original_store
