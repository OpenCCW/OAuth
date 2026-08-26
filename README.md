# OpenCCW OAuth

第三方网站使用 OAuth 登录共创世界 CCW 账号。

使用方法参考 `website` 文件夹。

演示: https://openccw.github.io/OAuth/

## 网址参数

- 访问 OpenCCW OAuth 作品
  - `oauth-state`: 随机的 64 个字符的 hex ，前 16 个字符要保存，用于回调后解密。
  - `oauth-url`: 回调的 url 。

- 回调 `oauth-url`
  - `ccw-oauth`: 返回的密文响应，使用 `AES-CBC` 解密后请求 OAuth 接口即可创建新的登录会话并获取 Token（登录会话密码）。
