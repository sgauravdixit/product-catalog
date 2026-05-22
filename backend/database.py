import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()


def get_connection() -> pyodbc.Connection:
    conn_str = os.environ.get("AZURE_SQL_CONNECTIONSTRING")
    if not conn_str:
        raise RuntimeError("AZURE_SQL_CONNECTIONSTRING environment variable is not set")
    return pyodbc.connect(conn_str)
