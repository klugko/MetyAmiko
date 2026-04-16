def test_health(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_register(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new@example.com",
            "password": "Password123!",
            "full_name": "New User",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "new@example.com"
    assert data["full_name"] == "New User"


def test_register_duplicate_email(client, test_user):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "Password123!",
            "full_name": "Duplicate",
        },
    )
    assert res.status_code == 409


def test_login_success(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "Test1234!"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrong"},
    )
    assert res.status_code == 401


def test_get_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"


def test_update_profile(client, auth_headers):
    res = client.patch(
        "/api/v1/auth/me",
        json={"full_name": "Updated Name", "company": "New Corp"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "Updated Name"


def test_unauthorized_access(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 403
