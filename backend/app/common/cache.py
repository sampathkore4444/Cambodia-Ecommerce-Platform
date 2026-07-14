import json
import hashlib
import logging
from functools import wraps
from typing import Optional

logger = logging.getLogger(__name__)

_redis_client = None


def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            import redis
            _redis_client = redis.Redis(
                host="redis", port=6379, db=1, decode_responses=True, socket_connect_timeout=2
            )
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def cache_key(*args) -> str:
    raw = json.dumps(args, sort_keys=True, default=str)
    return hashlib.md5(raw.encode()).hexdigest()


def cached(prefix: str, ttl: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            r = get_redis()
            if r is None:
                return await func(*args, **kwargs)

            skip_cache = kwargs.pop("skip_cache", False)
            if skip_cache:
                return await func(*args, **kwargs)

            key_parts = [prefix] + [str(a) for a in args] + [f"{k}={v}" for k, v in sorted(kwargs.items()) if k != "db"]
            k = cache_key(*key_parts)

            try:
                cached_val = r.get(k)
                if cached_val:
                    return json.loads(cached_val)
            except Exception:
                pass

            result = await func(*args, **kwargs)

            try:
                r.setex(k, ttl, json.dumps(result, default=str))
            except Exception:
                pass

            return result
        return wrapper
    return decorator


def invalidate_cache(prefix: str):
    r = get_redis()
    if r is None:
        return
    try:
        keys = r.keys(f"*{prefix}*")
        if keys:
            r.delete(*keys)
    except Exception:
        pass
