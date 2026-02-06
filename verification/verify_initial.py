from playwright.sync_api import sync_playwright

def verify_board(page):
    # ファイル名から推測されるリンクテキストの一部
    filename_part = "sample_board.json"

    # 1. ホームページへ移動
    page.goto("http://localhost:5173/")

    # 2. ファイルが表示されるまで待機（リスト更新に少し時間がかかるかも）
    page.wait_for_selector(f"text={filename_part}", timeout=5000)

    # 3. "View Board" リンクをクリック
    # リスト構造: li -> div -> span(filename), Link(View Board)
    # ファイル名の近くにある "View Board" をクリックしたい
    # xpathやcssセレクタで特定するのが確実
    # ここでは単純にURLへ直接飛ぶ（確実にボードUIを見たいので）
    # page.goto(f"http://localhost:5173/board/1770352949630-sample_board.json")

    # UI上でクリックするフローを試す
    # 親要素を探して、その中のリンクをクリック
    row = page.locator("li").filter(has_text=filename_part)
    row.get_by_role("link", name="View Board").click()

    # 4. ボードが表示されるのを待つ
    page.wait_for_selector("text=Project Alpha", timeout=10000) # ボード名
    page.wait_for_selector("text=To Do") # リスト名

    # 5. スクリーンショット
    page.screenshot(path="verification/initial_state.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_board(page)
            print("Screenshot saved to verification/initial_state.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()
