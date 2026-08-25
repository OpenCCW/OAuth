const textEncoder = new TextEncoder;
const textDecoder = new TextDecoder;

const oauthKeyName = "ccw-oauth-key"
const oauthParamName = "ccw-oauth"

const base64ToBytes = (
    Uint8Array.fromBase64
        ? (input) => Uint8Array.fromBase64(input)
        : (input) => Uint8Array.from(atob(input), v => v.charCodeAt())
);

;
(async () => {
    try {
        const locURL = new URL(location.href)
        const oauthBody = locURL.searchParams.get(oauthParamName)
        if (oauthBody) {
            const key = localStorage.getItem(oauthKeyName)
            if (!key) return;

            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                textEncoder.encode(key),
                { name: 'AES-CBC' },
                false,
                ['decrypt']
            )
            const codeBuf = await crypto.subtle.decrypt(
                {
                    name: 'AES-CBC',
                    iv: textEncoder.encode("GSs0NL83MBynOzVh")
                },
                cryptoKey,
                base64ToBytes(oauthBody)
            )

            // guestId不需要安全随机数
            let guestId = ''
            for (; guestId.length < 32;) {
                guestId += (0 | 16 * Math.random()).toString(16)
            }

            let response = await fetch("https://community-web.ccw.site/health/check", {
                method: "POST",
                headers: {
                    "Guest-Id": guestId
                }
            })
            if (!response.ok)
                throw Error(`failed to fetch health check: ${response.status} ${response.statusText}`);
            let result = await response.json()
            if (result.status != 200)
                throw Error(`failed to fetch health check: ${result.msg}`);

            const hmacKey = result.body.reduce((p, v) => v.traceId[parseInt(v.traceId[0], 16) + 1] + p, '')

            const body = JSON.stringify({
                code: textDecoder.decode(codeBuf)
            })

            const b = Date.now().toString()

            // 使用 tinyhmacmd5 生成 A 请求头
            const a = md5("ccw" + body + b, hmacKey)

            response = await fetch("https://sso.ccw.site/oauth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "A": a,
                    "B": b
                },
                body
            })
            if (!response.ok)
                throw Error(`failed to oauth token: ${response.status} ${response.statusText}`);
            result = await response.json()
            if (result.status != 200)
                throw Error(`failed to oauth token: ${result.msg}`);

            // 完成
            localStorage.removeItem(oauthKeyName)

            textareaResult.value = JSON.stringify(result, null, 4)
        }
    } catch (e) {
        console.error(e)
        textareaResult.value = e
    }
})();

btnLoginCCW.onclick = () => {
    btnLoginCCW.disabled = true

    // 使用安全随机数生成state。
    const state = crypto.getRandomValues(new Uint8Array(32)).reduce((p, v) => p + (v >> 4 && '') + v.toString(16), '')

    // 后续会用这个解密响应内容
    localStorage.setItem(oauthKeyName, state.slice(0, 16))

    // 跳转
    const locURL = new URL(location.href)
    locURL.searchParams.delete(oauthParamName)
    const url = new URL("https://www.ccw.site/player/6a8c03a62c5c8e06faa223ff?autorun=1&fullscreen=false")
    url.searchParams.set("oauth-state", state)
    url.searchParams.set("oauth-url", locURL.href)
    location.assign(url) // 保留历史记录
}
btnLoginCCW.disabled = false
