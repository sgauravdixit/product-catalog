import logging
import os
import re

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def _parse_conn_str(conn_str: str) -> dict:
    result = {}
    for part in conn_str.split(';'):
        part = part.strip()
        if '=' not in part:
            continue
        key, _, value = part.partition('=')
        result[key.strip().lower()] = value.strip().strip('{}')
    return result


def get_connection():
    conn_str = os.environ.get("AZURE_SQL_CONNECTIONSTRING")
    if not conn_str:
        raise RuntimeError("AZURE_SQL_CONNECTIONSTRING environment variable is not set")

    errors = []

    # Try pyodbc with ODBC Driver 18 (default on Azure App Service Linux)
    try:
        import pyodbc
        modified = re.sub(
            r'Driver=\{[^}]+\}',
            'Driver={ODBC Driver 18 for SQL Server}',
            conn_str,
            flags=re.IGNORECASE,
        )
        conn = pyodbc.connect(modified, timeout=30)
        logger.info("DB connected via ODBC Driver 18 for SQL Server")
        return conn
    except Exception as e:
        errors.append(f"ODBC18: {e}")
        logger.warning("ODBC Driver 18 unavailable: %s", e)

    # Try pyodbc with ODBC Driver 17
    try:
        import pyodbc
        modified = re.sub(
            r'Driver=\{[^}]+\}',
            'Driver={ODBC Driver 17 for SQL Server}',
            conn_str,
            flags=re.IGNORECASE,
        )
        conn = pyodbc.connect(modified, timeout=30)
        logger.info("DB connected via ODBC Driver 17 for SQL Server")
        return conn
    except Exception as e:
        errors.append(f"ODBC17: {e}")
        logger.warning("ODBC Driver 17 unavailable: %s", e)

    # Fall back to pymssql — no system ODBC driver required
    try:
        import pymssql
        params = _parse_conn_str(conn_str)
        server = params.get('server', '').replace('tcp:', '').split(',')[0]
        database = params.get('database', '')
        user = params.get('uid', params.get('username', ''))
        password = params.get('pwd', params.get('password', ''))
        conn = pymssql.connect(
            server=server, user=user, password=password,
            database=database, login_timeout=30,
        )
        logger.info("DB connected via pymssql")
        return conn
    except Exception as e:
        errors.append(f"pymssql: {e}")
        logger.error("pymssql fallback failed: %s", e)

    raise RuntimeError(f"All DB connection methods failed — {'; '.join(errors)}")
