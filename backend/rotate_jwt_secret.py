#!/usr/bin/env python3
"""JWT secret rotation helper.

Usage:
    # Generate a brand new secret
    python rotate_jwt_secret.py generate

    # Print the .env update instructions for rotating
    python rotate_jwt_secret.py rotate <current-secret>

This prints the recommended .env changes when rotating JWT secrets.
"""
from __future__ import annotations

import sys
import secrets


def generate_secret() -> str:
    return secrets.token_hex(64)


def print_rotation(current_secret: str) -> None:
    new_secret = generate_secret()
    print("=" * 70)
    print("JWT SECRET ROTATION")
    print("=" * 70)
    print()
    print("1. Add the CURRENT secret to the previous-keys list:")
    print()
    print(f"   JWT_SECRET_KEY={new_secret}")
    print(f"   JWT_PREVIOUS_SECRET_KEYS={current_secret}")
    print()
    print("2. After deploying, ALL existing tokens will still validate.")
    print()
    print("3. Once all tokens have naturally expired (30 days max),")
    print("   you can remove JWT_PREVIOUS_SECRET_KEYS.")
    print()
    print("=" * 70)


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in ("generate", "rotate"):
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "generate":
        secret = generate_secret()
        print(f"Generated JWT secret:\n{secret}")
    elif cmd == "rotate":
        if len(sys.argv) < 3:
            print("Usage: rotate_jwt_secret.py rotate <current-jwt-secret>")
            sys.exit(1)
        print_rotation(sys.argv[2])


if __name__ == "__main__":
    main()
