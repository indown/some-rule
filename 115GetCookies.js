/*
参考chavyleung和NobyDa的写法
//饿了么

> 代码已同时兼容 Surge & QuanX, 使用同一份签到脚本即可


## 配置 (Surge)

```properties
[MITM]
h5.ele.me

[Script]
http-request ^https:\/\/h5\.ele\.me\/restapi\/eus\/v\d\/current_user$ script-path=elemGetCookies.js
cron "0 5 0 * * *" script-path=elemSign.js
```

## 配置 (QuanX)

```properties
[MITM]
h5.ele.me

[rewrite_local]

^https:\/\/h5\.ele\.me\/restapi\/eus\/v\d\/current_user$ url script-request-header elemGetCookies.js




[task_local]
5 0 * * * elemSign.js
```

## 说明

1. 先把h5.ele.me`加到`[MITM]`
2. 再配置重写规则:
   - Surge: 把两条远程脚本放到`[Script]`
   - QuanX: 把`elemGetCookies.js`和`elemSign.js`传到`On My iPhone - Quantumult X - Scripts` (传到 iCloud 相同目录也可, 注意要打开 quanx 的 iCloud 开关)
3. 打开 APP, 访问下`我的`>`签到领红包`(左上角)
4. 系统提示: `获取Cookie: 成功` （如果不提示获取成功, 尝试杀进程再进`个人`>`每日签到`）
5. 最后就可以把第 1 条脚本注释掉了

> 第 1 条脚本是用来获取 cookie 的, 用浏览器访问一次获取 cookie 成功后就可以删掉或注释掉了, 但请确保在`登录成功`后再获取 cookie.

> 第 2 条脚本是签到脚本, 每天`00:05:00`执行一次.
*/

const CookieName = "115";
const sy = init();
GetCookie();

function GetCookie() {
  if ($request.headers) {
    var CookieValue = $request.headers["Cookie"];
    const obj = format(CookieValue)
    const res = ['UID','CID','SEID', 'KID', 'PHPSESSID', 'USERSESSIONID'].map((item) => {
      if(obj[item]) {
         return `${item}=${obj[item]}`
      }
    }).filter(Boolean).join(';')
    console.log(res)
    sy.msg("更新" + res + "Cookie‼️", "", "");
   
  } else {
    sy.msg(
      "写入" + CookieName + "Cookie失败‼️",
      "",
      "配置错误, 无法读取请求头, "
    );
  }
}
function format(inputString) {
  const keyValuePairs = inputString.split(";");

  // 2. 初始化一个空对象
  const result = {};

  // 3. 遍历每个键值对，去除空格并根据等号拆分
  keyValuePairs.forEach((pair) => {
    // 去除前后的空格
    const trimmedPair = pair.trim();

    // 如果trimmedPair不为空
    if (trimmedPair) {
      // 根据等号拆分成键和值
      const [key, value] = trimmedPair.split("=");

      // 存储到对象中
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    }
  });
  return result
}
function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true;
  };
  isQuanX = () => {
    return undefined === this.$task ? false : true;
  };
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key);
    if (isQuanX()) return $prefs.valueForKey(key);
  };
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val);
    if (isQuanX()) return $prefs.setValueForKey(key, val);
  };
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body);
    if (isQuanX()) $notify(title, subtitle, body);
  };
  log = (message) => console.log(message);
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb);
    }
    if (isQuanX()) {
      url.method = "GET";
      $task.fetch(url).then((resp) => cb(null, {}, resp.body));
    }
  };
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb);
    }
    if (isQuanX()) {
      url.method = "POST";
      $task.fetch(url).then((resp) => cb(null, {}, resp.body));
    }
  };
  done = (value = {}) => {
    $done(value);
  };
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done };
}
sy.done();


