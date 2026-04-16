def test_dashboard_stats(client, auth_headers):
    res = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "active_offers" in data
    assert "total_cvs" in data
    assert "total_matchings" in data
    assert "avg_score" in data
    assert data["active_offers"] == 0


def test_dashboard_after_creating_offer(client, auth_headers):
    client.post(
        "/api/v1/offers",
        json={
            "title": "Active Offer",
            "description": "Test",
            "contract_type": "cdi",
            "status": "active",
        },
        headers=auth_headers,
    )
    res = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert res.json()["active_offers"] == 1
