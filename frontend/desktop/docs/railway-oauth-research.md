# Railway 对外 OAuth Apps、GitHub 与 OAuth 标准调研

调研日期：2026-11-03（Asia/Shanghai）。范围：官方文档、实时公开发现文档、Railway 官方 CLI 源码；未登录 Railway 管理台，未注册或修改应用，未实测第三方授权和撤销。当前 API 资料先通过 Context7 `/railwayapp/docs` 检索，再与官方页面、官方源文件交叉核对。

## 结论

建议参考 Railway 的完整授权产品模型：**应用注册 + OAuth/OIDC + 用户选择资源 + API 强制权限 + 可管理、可撤销的应用授权**。只提供设备码、授权码和 token 接口，还不足以成为可公开接入的开发者平台。这是针对 Sealos 的设计判断，并非 Railway 对其他平台的要求。

浏览器、桌面和移动端优先授权码 + PKCE；无浏览器环境提供设备流。对基础设施平台，最值得借鉴的是 Railway 的资源授权边界，以及 GitHub Apps 的安装/细粒度权限模型，而不是照搬旧式 OAuth Apps 的宽泛账号授权。[Railway 总览](https://docs.railway.com/integrations/oauth)、[GitHub 迁移建议](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/migrating-oauth-apps-to-github-apps)

## Railway 明确公开的产品和协议

| 方面       | 官方资料确认的行为                                                                                                               | 对 Sealos 的启示（建议）                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 应用所有权 | 应用在 workspace 下创建，只有 workspace admin 可以创建、管理；设置入口为 Developer                                               | 区分开发者所属组织与最终用户授权的资源，不能因“应用属于某 workspace”就默认获得该 workspace 权限 |
| 应用类型   | Web = confidential，secret 必须、PKCE 推荐；Native = public，无 secret、PKCE 必须。其 Native 分类包括 CLI、移动/桌面和纯前端 SPA | 显式配置客户端类型与 token endpoint 认证方式；前端和安装包不能保密通用 secret                   |
| 认证方式   | Web 支持 `client_secret_basic` / `client_secret_post`；public 使用 `none`                                                        | 面向 Web 后端补齐标准客户端认证；新平台可以把 S256 对所有授权码客户端设为强制策略               |
| 回调与注册 | UI 注册多条 redirect URI；请求要求精确匹配；secret 仅首次展示；DCR 支持 `POST /oauth/register` 并有限流                          | 第一阶段先做受控 UI/人工注册，不必立即开放 DCR                                                  |

以上事实见 [Creating an App](https://docs.railway.com/integrations/oauth/creating-an-app)。文档描述自助创建，但没有说明所有应用都需人工审核，也没有提供完整的开发/发布、认证标记或滥用审核政策；不能据此声称“完全无审核”。

应用配置可以修改名称、说明、图标和回调，并生成或撤销额外 secret。文档称 secret 不过期；删除 App 使其全部 token 立即失效。动态注册的应用不出现在 workspace UI，使用 registration access token 管理；更新动态客户端会替换 secret。以上是 Railway 产品选择，不是应普遍照搬的安全标准。[Managing an App](https://docs.railway.com/integrations/oauth/managing-an-app)

### 登录、身份和 token

- 授权码流程叠加 OIDC；授权入口 `/oauth/auth`，兑换/刷新入口 `/oauth/token`，身份信息入口 `/oauth/me`。必须包含 `openid`；access token 用于 GraphQL API，ID token 用于确认身份，二者职责不同。
- Access token 为 opaque，1 小时过期。请求 `offline_access` 并显式 `prompt=consent` 才签发 refresh token。
- Refresh token 可能先返回同一值，之后轮换；客户端始终保存最新响应值。新值有从签发时起 1 年有效期；每次用户授权最多 100 个 refresh token，超额自动撤销最老值。支持 PAR `/oauth/request`。

来源：[Login & Tokens](https://docs.railway.com/integrations/oauth/login-and-tokens)。不应把其“一开始可能不轮换”当作所有 public client 的标准范式；具体轮换窗口/策略未公开。

故障文档进一步说明：重放已经轮换的 refresh token 会撤销整个 authorization，要求重新授权；`email/name/picture` 从 `/oauth/me` 获取，不应假设一定在 ID token 内。[Troubleshooting](https://docs.railway.com/integrations/oauth/troubleshooting)

### 权限不只有 scope，还包含用户选择的具体资源

公开 scope 表包括 `openid`、`email`、`profile`、`offline_access`，以及 `workspace:viewer/member/admin`、`project:viewer/member`。用户在确认页选择具体 workspace/project；请求的 scope 是权限上限，实际不能超过该用户的角色。已授权同等或更大 scopes 时可能跳过确认，`prompt=consent` 可以强制展示。对 Sealos 的关键启示是：**有效授权应同时满足能力、资源集合与用户当前权限，不能只在确认页展示 scope。**[Scopes & User Consent](https://docs.railway.com/integrations/oauth/scopes-and-user-consent)

其 API 文档明确，workspace/project 查询只返回获授权资源；workspace 查询还要求 `email` 和 `profile`。后者是 Railway 实现上的依赖，不属于 OAuth 标准，也不建议 Sealos 人为耦合身份信息与基础设施读取权限。[Fetching Workspaces or Projects](https://docs.railway.com/integrations/oauth/fetching-workspaces-or-projects)

用户可以在 Account Settings → Apps 查看授权和资源，添加/移除资源，或 Revoke Access；文档承诺撤销立即使应用持有的全部 token 失效。公开发现元数据没有声明 `revocation_endpoint`，本文没有找到公开 RFC 7009 端点契约，不能自行拼接 `/oauth/revoke`。用户界面撤销能力与公开撤销 API 是两个不同问题。[Authorized Apps](https://docs.railway.com/integrations/oauth/authorized-apps)、[实时发现元数据](https://backboard.railway.com/oauth/.well-known/openid-configuration)

### 实时发现文档和设备流

实际只读请求 `https://backboard.railway.com/oauth/.well-known/openid-configuration`，2026-11-03 返回的相关字段如下（节选）：

```json
{
  "issuer": "https://backboard.railway.com",
  "authorization_endpoint": "https://backboard.railway.com/oauth/auth",
  "token_endpoint": "https://backboard.railway.com/oauth/token",
  "userinfo_endpoint": "https://backboard.railway.com/oauth/me",
  "jwks_uri": "https://backboard.railway.com/oauth/jwks",
  "device_authorization_endpoint": "https://backboard.railway.com/oauth/device/auth",
  "registration_endpoint": "https://backboard.railway.com/oauth/register",
  "code_challenge_methods_supported": ["S256"],
  "response_types_supported": ["code"],
  "grant_types_supported": [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code",
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "token_endpoint_auth_methods_supported": [
    "client_secret_basic",
    "client_secret_post",
    "none",
    "private_key_jwt"
  ],
  "id_token_signing_alg_values_supported": ["ES256"],
  "authorization_response_iss_parameter_supported": true
}
```

这是服务端能力宣告，不是所有 client 的默认准入证明。元数据额外包含 `project:admin`、`notifications`、`ssh_keys` 等 scopes，而面向第三方的文档列表较窄；`private_key_jwt` 和 token exchange 的外部注册规则也未在已读接入文档中说明。开发者接入应优先依赖明确文档契约。[实时发现元数据](https://backboard.railway.com/oauth/.well-known/openid-configuration)

Railway 官方 CLI 当前源码进一步确认了真实使用方式：

1. 有本地浏览器：监听 `127.0.0.1:0` 动态端口，系统浏览器打开授权码 + S256 PKCE，验证回调 state 后兑换 token。
2. `--browserless`、SSH/CI/缺少显示环境，或打开浏览器失败：发起 `/oauth/device/auth`，显示 verification URL、user code，轮询 `/oauth/token`，grant 为 RFC 8628 的完整 URN；`slow_down` 后间隔增加 5 秒。
3. 两条流程最终都保存 access/refresh token。CLI 请求一组较宽的第一方 scopes，不能把这些 scopes 当成第三方都应申请的最小权限。

来源：[CLI login.rs](https://github.com/railwayapp/cli/blob/master/src/commands/login.rs)、[CLI oauth.rs](https://github.com/railwayapp/cli/blob/master/src/oauth.rs)。这是第一方客户端源码证据；尚未验证普通第三方 client 注册后是否默认允许 device grant，或需要额外申请。

## GitHub 应借鉴什么

| 维度         | OAuth Apps                               | GitHub Apps                                                    |
| ------------ | ---------------------------------------- | -------------------------------------------------------------- |
| 权限组织     | 用户授权的 scopes，通常较宽              | 应用注册时定义细粒度 permissions，并选择安装资源               |
| 资源边界     | 用户可访问资源，再受 scopes/组织策略限制 | 安装时指定仓库；user token 的权限是用户与 app 可访问集合的交集 |
| 执行身份     | 代表用户                                 | 可代表用户，也可使用安装身份独立执行                           |
| 组织生命周期 | 依赖授权用户                             | 安装可在安装人离职后继续存在，适合团队自动化                   |

来源：[两类 App 的官方差异](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)、[GitHub App user token](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)。对 Sealos，个人登录和组织级部署集成应作为不同授权场景设计；不必在首期直接复刻完整 installation/token/webhook 体系。

GitHub 当前 OAuth Apps 文档已经支持可选过期 token：access token 8 小时，refresh token 6 个月无使用过期，支持运行时请求 `offline_access`；不能再说“GitHub OAuth Apps 一定没有 refresh token”。Device flow 要在 App 设置显式启用，不应默认给所有新应用开放。[Authorizing OAuth apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)

GitHub 建议 public client 在能使用回调时优先授权码 + PKCE；device flow 没有回调绑定，容易被用于远程钓鱼，应仅按环境需要启用。这个选择比“统一让所有客户端都走设备流”更适合 Sealos 对外开放。[GitHub App 安全实践](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)

## 标准基线与平台建议

下表中“标准”是协议要求或标准建议，“平台建议”是为 Sealos 提出的实现取舍，不应混为强制标准。

| 范围    | 标准基线                                                                                    | Sealos 平台建议                                                                                 |
| ------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 授权码  | Public client 必须 PKCE；confidential 推荐 PKCE；精确回调校验，原生 loopback 端口有特定例外 | 对全部新应用统一要求 S256；保留 state 校验，绑定请求与浏览器；不用 implicit/password grants     |
| Refresh | Public client 必须发送者约束或轮换以检测重放，且绑定用户同意的 scope/资源                   | 统一两种 grant 的 refresh 族、轮换、撤销；并发与丢响应语义明确；不要机械模仿 Railway 的延迟轮换 |
| 权限    | 限制 token 的权限与目标 API；用户同意后不可扩大刷新权限                                     | 最终允许 = app 注册上限 ∩ 用户同意能力 ∩ 已选资源 ∩ 用户当前权限，资源服务逐请求落实            |

来源：[RFC 9700 §2、§4.14](https://www.rfc-editor.org/rfc/rfc9700.html)。授权码、设备流是取得 grant 的方式；后续权限边界不应随 grant 方式不同而放宽。这一统一模型是平台设计建议。

| 范围        | 标准基线                                                                                                                    | Sealos 平台建议                                                                                                               |
| ----------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 原生应用    | 使用外部浏览器；public client 不依赖安装包中固定 secret；支持适当原生回调                                                   | 移动端优先验证 HTTPS App Link；桌面支持 loopback；不要通过 WebView 收用户密码                                                 |
| 设备流      | device code 与 user code 分工；interval 默认 5 秒，slow_down 后后续间隔增加 5 秒；处理 pending/denied/expired；高熵和防猜码 | 每客户端显式准入；确认页显示应用、操作与设备上下文；要求用户核对 user code；多维限流与原子单次领取                            |
| 撤销        | RFC 7009 定义撤销接口，已失效或未知 token 返回 200；撤销传播可能有延迟                                                      | 同时做用户“取消授权”和开发者 RFC 7009 API；说明 access token/衍生凭证最长失效时间，不能只停止刷新就宣传立即失效               |
| 发现与 OIDC | RFC 8414 发布授权服务器能力；OIDC 定义身份层、ID token 和 UserInfo                                                          | 如果宣传“使用 Sealos 登录”，补齐 OIDC、JWKS、Discovery 和稳定 sub；access token 与 ID token 分开，优先使用成熟客户端/服务端库 |

来源：[RFC 8252](https://www.rfc-editor.org/rfc/rfc8252.html)、[RFC 8628 §3、§5](https://www.rfc-editor.org/rfc/rfc8628.html)、[RFC 7009](https://www.rfc-editor.org/rfc/rfc7009.html)、[RFC 8414](https://www.rfc-editor.org/rfc/rfc8414.html)、[OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html)。

建议的首期开放范围是：受控注册、授权码 + S256 PKCE、按需启用设备流、最小角色/资源授权、统一 refresh/revocation、开发者应用管理与用户授权管理。OIDC 在承诺对外登录产品时加入；DCR、PAR、token exchange、独立 installation 身份可以在真实需求出现后扩展。该顺序是本报告建议，不是 RFC 的统一上线清单。

## 证据边界

- 已确认：公开资料和当日元数据所述能力，当前官方 CLI 对两条 grant 的实际调用路径。
- 未验证：Railway 后端内部数据模型、授权检查具体实现、第三方 client 的设备流/额外 scopes 准入、实测撤销传播与完整审核流程。
- 不应推断：存在 discovery 字段就代表每个 client 都被允许；第一方 CLI 的 scopes 等于第三方公共承诺；没有公开 revoke API 就没有后台撤销能力；secret 不过期、refresh 一年等产品值是所有平台的最佳取值。
