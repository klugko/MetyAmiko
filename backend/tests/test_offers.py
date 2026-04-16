def test_create_offer(client, auth_headers):
    res = client.post(
        "/api/v1/offers",
        json={
            "title": "Dev Full Stack",
            "description": "We need a full stack developer",
            "location": "Paris",
            "contract_type": "cdi",
            "experience_min": 3,
            "status": "active",
            "skills": [
                {"skill_name": "Python", "weight": 5, "category": "technical"},
                {"skill_name": "React", "weight": 4, "category": "technical"},
            ],
        },
        headers=auth_headers,
    )
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Dev Full Stack"
    assert data["status"] == "active"
    assert len(data["skills"]) == 2


def test_list_offers(client, auth_headers):
    # Create 2 offers
    for i in range(2):
        client.post(
            "/api/v1/offers",
            json={
                "title": f"Offer {i}",
                "description": f"Description {i}",
                "contract_type": "cdi",
            },
            headers=auth_headers,
        )
    res = client.get("/api/v1/offers", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["total"] == 2


def test_get_offer(client, auth_headers):
    create_res = client.post(
        "/api/v1/offers",
        json={
            "title": "Test Offer",
            "description": "A test",
            "contract_type": "cdd",
        },
        headers=auth_headers,
    )
    offer_id = create_res.json()["id"]
    res = client.get(f"/api/v1/offers/{offer_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Test Offer"


def test_update_offer(client, auth_headers):
    create_res = client.post(
        "/api/v1/offers",
        json={
            "title": "Original",
            "description": "Original desc",
            "contract_type": "cdi",
        },
        headers=auth_headers,
    )
    offer_id = create_res.json()["id"]
    res = client.patch(
        f"/api/v1/offers/{offer_id}",
        json={"title": "Updated"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Updated"


def test_delete_offer(client, auth_headers):
    create_res = client.post(
        "/api/v1/offers",
        json={
            "title": "To Delete",
            "description": "Will be deleted",
            "contract_type": "cdi",
        },
        headers=auth_headers,
    )
    offer_id = create_res.json()["id"]
    res = client.delete(f"/api/v1/offers/{offer_id}", headers=auth_headers)
    assert res.status_code == 204

    # Should not appear in list
    list_res = client.get("/api/v1/offers", headers=auth_headers)
    assert list_res.json()["total"] == 0


def test_duplicate_offer(client, auth_headers):
    create_res = client.post(
        "/api/v1/offers",
        json={
            "title": "Original Offer",
            "description": "Original description",
            "contract_type": "cdi",
            "skills": [{"skill_name": "Python", "weight": 5}],
        },
        headers=auth_headers,
    )
    offer_id = create_res.json()["id"]
    res = client.post(f"/api/v1/offers/{offer_id}/duplicate", headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["title"] == "[Copie] Original Offer"
    assert res.json()["status"] == "draft"
    assert len(res.json()["skills"]) == 1


def test_search_offers(client, auth_headers):
    client.post(
        "/api/v1/offers",
        json={"title": "Python Developer", "description": "Python expert", "contract_type": "cdi"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/offers",
        json={"title": "Java Developer", "description": "Java expert", "contract_type": "cdi"},
        headers=auth_headers,
    )
    res = client.get("/api/v1/offers?search=Python", headers=auth_headers)
    assert res.json()["total"] == 1


def test_offer_not_found(client, auth_headers):
    res = client.get("/api/v1/offers/999", headers=auth_headers)
    assert res.status_code == 404
