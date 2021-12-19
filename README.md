## [2019 Side Project] 網站 API 開發

#### 用途
瀏覽者能夠針對目標網站做額外的回應及點讚，同時可作為目標站主的相關問與答、回報、回應等。

#### 開發技術
Node.js、Koa、MongoDB、Redis、Mongoose、Selenium-Webdriver

---

#### 欄位定義
###### account
> * 編號 identity
> * 暱稱 nick
> * 信箱 email
> * 註解 note

###### website
> * 編號 identity
> * 對象編號 tid `(kind==path ? identity(host) : null)`
> * 帳號 account.identity
> * 類型 kind `(host || path)`
> * 名 name
> * 註解 note

###### comment
> * 編號 identity
> * 對象編號 tid `(kind==reply ? identity(normal) : identity(website))`
> * 帳號 account.identity
> * 類型 kind `(normal || reply)`
> * 內容 content

###### grade
> * 編號 identity
> * 帳號 account.identity
> * 對象編號 tid `(identity)`
> * 類型 kind `(comment.normal || comment.reply || website.host || website.path)`
> * 評級 liking `(1 || -1)`

###### subscribe
> * 編號 identity
> * 帳號 account.identity
> * 訂閱對象編號 wid `(identity)`
> * 類型 kind `(comment || grade)`
> * 行為 act `(identity)`

---

#### API 傳回格式
###### website
```json
{
	"identity": "016a95adb93500007c90000000000000",
	"tid": null,
	"kind": "host",
	"name": "127.0.0.1"
},
{
	"identity": "016a95adb33500007c10000000000000",
	"tid": "016a95adb93500007c90000000000000",
	"kind": "path",
	"name": "/u/2/event/add"
}
```

###### comment
```json
{
	"identity": "016a35adb93500007e10000000000000",
	"tid": null,
	"account": "01641d0bbd960000424d000000000000",
	"kind": "normal",
	"content": "這是主留言喔"
},
{
	"identity": "013a55adb935000032e0000000000000",
	"tid": "016a35adb93500007e10000000000000",
	"account": "01641d0bbd960000424d000000000000",
	"kind": "reply",
	"content": "這是留言中的回覆喔"
}
```
###### grade
```json
{
	"identity": "014c67adb234200034e0000000000000",
	"tid": "016a95adb33500007c10000000000000",
	"account": "01641d0bbd960000424d000000000000",
	"kind": "website.path",
	"lv": -1
}
```
