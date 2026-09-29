"""
Bearer-token verification for the chat backend.

Production returned `401 Invalid token` to every signed-in user while anonymous
requests worked, because Supabase signs user access tokens with ES256 keys published
as a JWKS and the backend only ever verified HS256 against `JWT_SECRET`. These tests
hold real ES256 tokens up against the real verification code.
"""

import time

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.middleware import auth
from app.config import settings


@pytest.fixture(autouse=True)
def _known_configuration(monkeypatch):
    """
    Pin the settings these tests depend on.

    CI runs with DEBUG=true and no .env, where JWT_SECRET and the Supabase URL are
    empty strings — tests that read them ambiently pass on a developer machine and
    fail on the runner.
    """
    monkeypatch.setattr(settings, "JWT_SECRET", "auth-test-secret", raising=False)
    monkeypatch.setattr(settings, "NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co", raising=False)


def _cred(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _claims(sub: str, *, exp_offset: int = 3600, aud: str = "authenticated") -> dict:
    return {"sub": sub, "aud": aud, "exp": int(time.time()) + exp_offset}


@pytest.fixture
def hs256_token() -> str:
    return jwt.encode(_claims("user-hs"), settings.JWT_SECRET, algorithm="HS256")


@pytest.fixture(scope="module")
def ec_private_key():
    return ec.generate_private_key(ec.SECP256R1())


@pytest.fixture
def es256_token(ec_private_key) -> str:
    return jwt.encode(_claims("user-es"), ec_private_key, algorithm="ES256", headers={"kid": "test-kid"})


def _serve_key(public_key):
    """A JWKS client that returns the given public key, standing in for Supabase's."""
    class Stub:
        def get_signing_key_from_jwt(self, token):
            return type("Fetched", (), {"key": public_key})()

    return Stub()


# ── the regression ───────────────────────────────────────────────────────────


def test_an_es256_token_would_have_been_rejected_by_the_old_hs256_only_check(es256_token):
    """Pins the actual production defect, so it cannot quietly come back."""
    with pytest.raises(jwt.InvalidTokenError):
        jwt.decode(es256_token, settings.JWT_SECRET, algorithms=["HS256"], audience="authenticated")


def test_an_es256_token_verifies_against_the_jwks(monkeypatch, es256_token, ec_private_key):
    monkeypatch.setattr(auth, "_jwks", lambda: _serve_key(ec_private_key.public_key()))

    payload = auth.verify_supabase_jwt(_cred(es256_token))

    assert payload["sub"] == "user-es"


def test_a_legacy_hs256_token_still_verifies(hs256_token):
    """Projects and API keys on the shared secret must not be locked out by the change."""
    payload = auth.verify_supabase_jwt(_cred(hs256_token))

    assert payload["sub"] == "user-hs"


# ── it must still say no when no ─────────────────────────────────────────────


def test_a_forged_es256_token_is_rejected(monkeypatch, es256_token):
    other = ec.generate_private_key(ec.SECP256R1()).public_key()
    monkeypatch.setattr(auth, "_jwks", lambda: _serve_key(other))

    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred(es256_token))

    assert exc.value.status_code == 401
    assert "bad signature" in exc.value.detail


def test_an_unsupported_algorithm_is_rejected_without_trusting_the_header():
    token = jwt.encode(_claims("user"), "some-secret", algorithm="HS512")

    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred(token))

    assert exc.value.status_code == 401
    assert "HS512" in exc.value.detail


def test_an_expired_token_says_so_rather_than_invalid(hs256_token):
    expired = jwt.encode(_claims("user-hs", exp_offset=-60), settings.JWT_SECRET, algorithm="HS256")

    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred(expired))

    assert exc.value.status_code == 401
    assert exc.value.detail == "Token expired"


def test_the_wrong_audience_is_rejected(es256_token, ec_private_key, monkeypatch):
    token = jwt.encode(_claims("user-es", aud="service_role"), ec_private_key,
                       algorithm="ES256", headers={"kid": "test-kid"})
    monkeypatch.setattr(auth, "_jwks", lambda: _serve_key(ec_private_key.public_key()))

    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred(token))

    assert exc.value.status_code == 401
    assert "audience" in exc.value.detail


def test_a_jwks_outage_is_a_server_error_not_a_bad_credential(monkeypatch):
    class Boom:
        def get_signing_key_from_jwt(self, token):
            raise jwt.PyJWKClientError("supabase unreachable")

    # A header that parses but names ES256, so verification has to reach for the keys.
    token = jwt.encode(_claims("user"), ec.generate_private_key(ec.SECP256R1()),
                       algorithm="ES256", headers={"kid": "x"})
    monkeypatch.setattr(auth, "_jwks", lambda: Boom())

    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred(token))

    # Our outage must not be reported as the user's bad credential, or they get a
    # login loop instead of a retry.
    assert exc.value.status_code == 503


def test_malformed_credentials_are_rejected_not_crashed():
    with pytest.raises(HTTPException) as exc:
        auth.verify_supabase_jwt(_cred("not-a-jwt-at-all"))

    assert exc.value.status_code == 401
    assert "malformed" in exc.value.detail


def test_no_token_at_all_stays_anonymous():
    assert auth.verify_supabase_jwt(None) is None


def test_jwks_url_is_derived_from_the_project_url():
    assert settings.supabase_jwks_url == "https://example.supabase.co/auth/v1/.well-known/jwks.json"


def test_a_trailing_slash_on_the_project_url_does_not_double_up(monkeypatch):
    monkeypatch.setattr(settings, "NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co/", raising=False)

    assert settings.supabase_jwks_url == "https://example.supabase.co/auth/v1/.well-known/jwks.json"
