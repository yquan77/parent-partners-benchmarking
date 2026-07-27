import json
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4177"
ARTIFACTS = Path("/tmp/parent-partners-live-malay")
ARTIFACTS.mkdir(parents=True, exist_ok=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 390, "height": 844})
    current = {"slide_index": 0}
    console_errors = []

    def mock_current_slide(route):
        if route.request.method == "PATCH":
            payload = json.loads(route.request.post_data or "{}")
            current["slide_index"] = payload["slide_index"]
            route.fulfill(status=204, body="")
            return
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {
                    "slide_index": current["slide_index"],
                    "updated_at": "2026-07-27T08:00:00Z",
                }
            ]),
        )

    context.route("**/rest/v1/current_slide*", mock_current_slide)

    deck = context.new_page()
    deck.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    deck.goto(BASE_URL)
    deck.wait_for_load_state("networkidle")
    assert deck.locator(".slide").count() == 46
    assert current["slide_index"] == 0

    deck.keyboard.press("m")
    assert deck.locator("#malay-qr-overlay").get_attribute("aria-hidden") == "false"
    deck.wait_for_timeout(300)
    qr_nodes = deck.locator("#malay-qr-holder canvas, #malay-qr-holder img")
    assert qr_nodes.count() >= 1, {
        "html": deck.locator("#malay-qr-holder").inner_html(),
        "console_errors": console_errors,
    }
    deck.keyboard.press("Escape")
    assert deck.locator("#malay-qr-overlay").get_attribute("aria-hidden") == "true"

    phone = context.new_page()
    phone.on(
        "console",
        lambda message: console_errors.append(message.text)
        if message.type == "error"
        else None,
    )
    phone.goto(f"{BASE_URL}/my/")
    phone.wait_for_load_state("networkidle")
    phone.wait_for_timeout(250)
    assert phone.locator("#slide-number").inner_text() == "01 / 46"
    assert phone.locator("#connection-label").inner_text() == "Disambungkan"

    deck.bring_to_front()
    deck.keyboard.press("ArrowRight")
    deck.wait_for_timeout(250)
    assert current["slide_index"] == 1

    phone.bring_to_front()
    phone.wait_for_function(
        "document.querySelector('#slide-number').textContent === '02 / 46'",
        timeout=3500,
    )
    phone.wait_for_timeout(250)
    assert "Percubaan pertama" in phone.locator("#slide-text").inner_text()
    assert phone.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    phone.screenshot(path=str(ARTIFACTS / "mobile-live.png"), full_page=True)

    preview = context.new_page()
    preview.goto(f"{BASE_URL}/my/?preview=35")
    preview.wait_for_load_state("networkidle")
    preview.wait_for_timeout(250)
    assert preview.locator("#slide-number").inner_text() == "35 / 46"
    assert "menyerahkan tanggungjawab" in preview.locator("#slide-text").inner_text()

    overflow_slides = []
    for slide_number in range(1, 47):
        preview.goto(
            f"{BASE_URL}/my/?preview={slide_number}",
            wait_until="domcontentloaded",
        )
        preview.wait_for_timeout(220)
        fits = preview.evaluate(
            """() => {
                const meta = document.querySelector('.cue-meta').getBoundingClientRect();
                const text = document.querySelector('.cue-text').getBoundingClientRect();
                const foot = document.querySelector('.cue-foot').getBoundingClientRect();
                return text.top >= meta.bottom + 8 && text.bottom <= foot.top - 8;
            }"""
        )
        if not fits:
            overflow_slides.append(slide_number)
    assert not overflow_slides, f"Mobile text overlap on slides: {overflow_slides}"

    review = context.new_page()
    review.goto(f"{BASE_URL}/my/review.html")
    review.wait_for_load_state("networkidle")
    assert review.locator(".review-item").count() == 46

    desktop = context.new_page()
    desktop.set_viewport_size({"width": 1440, "height": 900})
    desktop.goto(f"{BASE_URL}/my/?preview=10")
    desktop.wait_for_load_state("networkidle")
    desktop.wait_for_timeout(250)
    desktop.screenshot(path=str(ARTIFACTS / "desktop-live.png"), full_page=True)

    assert not console_errors, console_errors
    browser.close()

print(f"PASS: live Malay sync and 46-slide mapping; screenshots: {ARTIFACTS}")
