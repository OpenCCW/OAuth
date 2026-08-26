# OpenCCW OAuth

第三方网站使用 OAuth 登录共创世界 CCW 账号。

使用方法参考 `website` 文件夹。

演示: https://openccw.github.io/OAuth/

## 网址参数

- 访问 OpenCCW OAuth 作品
  - `oauth-state`  
    随机的 64 个字符的 hex ，前 16 个字符要保存，用于回调后解密。  
    这个参数在官方的 OAuth 里叫 `client_id` ，官方客户端会使用固定的值。  
    但为了安全起见，建议使用 `crypto.getRandomValues` 生成随机值。  
  - `oauth-url`:  
    回调的网址。

- 回调 `oauth-url`
  - `ccw-oauth`  
    返回的密文响应。  
    **密钥**: 前面提到的 `oauth-state` 的开头 16 个字符，用 ASCII 或 UTF-8 编码。  
    **iv**: `"GSs0NL83MBynOzVh"` ，用 ASCII 或 UTF-8 编码。  
    使用 `AES-CBC` 解密后请求 OAuth 接口即可创建新的登录会话并获取 Token（登录会话密码）。  
