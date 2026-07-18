"""
超高速タイピング用の Playwright スクリプト
使い方は README を参照してください。
"""

import argparse
from playwright.sync_api import sync_playwright

JS_TYPER = r"""
(text, opts = { delay: 0 }) => {
    const delay = opts.delay || 0;
    const sendToTargets = (ev) => {
        try { document.activeElement && document.activeElement.dispatchEvent(ev); } catch (e) {}
        try { document.body && document.body.dispatchEvent(ev); } catch (e) {}
        try { document.dispatchEvent(ev); } catch (e) {}
        try { window.dispatchEvent(ev); } catch (e) {}
    };

    function makeKeyboardEvent(type, key, code) {
        const eventInit = {
            key: key,
            code: code,
            location: 0,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            repeat: false,
            isComposing: false,
            bubbles: true,
            cancelable: true
        };
        try {
            return new KeyboardEvent(type, eventInit);
        } catch (e) {
            // Fallback for very old environments
            const ev = document.createEvent('KeyboardEvent');
            ev.initKeyboardEvent(type, true, true, window, key, 0, '', false, '');
            return ev;
        }
    }

    function sendChar(ch) {
        const isAlpha = /^[A-Za-z]$/.test(ch);
        const code = isAlpha ? ('Key' + ch.toUpperCase()) : ('Digit' + ch);
        const down = makeKeyboardEvent('keydown', ch, code);
        sendToTargets(down);
        const press = makeKeyboardEvent('keypress', ch, code);
        sendToTargets(press);

        // If there is a focused input or textarea, update its value and emit input
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
            try {
                if (typeof active.value !== 'undefined') {
                    const start = active.selectionStart != null ? active.selectionStart : active.value.length;
                    const before = active.value.slice(0, start);
                    const after = active.value.slice(start);
                    active.value = before + ch + after;
                    active.setSelectionRange(start + 1, start + 1);
                    active.dispatchEvent(new Event('input', { bubbles: true }));
                } else if (active.isContentEditable) {
                    // Insert text at caret for contenteditable
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount) {
                        const range = sel.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(ch));
                        range.setStart(range.endContainer, range.endOffset);
                        range.setEnd(range.endContainer, range.endOffset);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        active.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            } catch (e) {}
        }

        const up = makeKeyboardEvent('keyup', ch, code);
        sendToTargets(up);
    }

    // Run synchronous or with tiny delays depending on opts.delay
    if (!delay) {
        for (let i = 0; i < text.length; i++) sendChar(text[i]);
    } else {
        let i = 0;
        const loop = () => {
            if (i >= text.length) return;
            sendChar(text[i]);
            i++;
            setTimeout(loop, delay);
        };
        loop();
    }
}
"""


def main():
    parser = argparse.ArgumentParser(description="Fast typist for typing-game pages")
    parser.add_argument('--url', required=True, help='Target URL')
    parser.add_argument('--text', help='Text to type (if omitted, script will try to read from common selectors)')
    parser.add_argument('--selector', help='CSS selector to click/focus before typing (optional)')
    parser.add_argument('--delay-ms', type=int, default=0, help='Inter-key delay in milliseconds (use non-zero if page ignores too-fast events)')
    parser.add_argument('--headless', action='store_true', help='Run browser headless')
    args = parser.parse_args()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=args.headless)
        page = browser.new_page()
        page.goto(args.url)
        page.wait_for_load_state('networkidle')

        if args.selector:
            try:
                page.click(args.selector)
            except Exception:
                pass
        else:
            # try to focus a likely input area by clicking the body
            try:
                page.click('body')
            except Exception:
                pass

        text = args.text
        if not text:
            # try to extract text from common selectors on typing sites
            candidates = ['#target', '#word', '.word', '.words', '#text', '.text-content']
            for sel in candidates:
                try:
                    t = page.query_selector(sel)
                    if t:
                        txt = t.inner_text().strip()
                        if txt:
                            text = txt
                            break
                except Exception:
                    continue
        if not text:
            print('No text to type. Provide --text or a selector that contains text.')
            browser.close()
            return

        # Run the fast typing inside the page context for maximum speed
        page.evaluate(JS_TYPER, text, { 'delay': args.delay_ms })
        print('Typed', len(text), 'characters.')
        browser.close()


if __name__ == '__main__':
    main()
