const $ = new API();

let cookies = [];
let notify, thisck = '';
!(async () => {

    // 判断环境变量里面是否有cookie
    if ($.env.isNode) {
        if (process.env.KS_COOKIE) {
            if (process.env.KS_COOKIE.indexOf(',') > -1) {
                cookies = process.env.KS_COOKIE.split(',');
            } else if (process.env.KS_COOKIE.indexOf('\n') > -1) {
                cookies = process.env.KS_COOKIE.split('\n');
            } else {
                cookies = [process.env.KS_COOKIE];
            }
        };
        notify = require('./sendNotify');
    }
    else {
        let ckStr = $.read('#kscookies');
        if (!!ckStr) {
            ckStr = ckStr.replace(/ /g, '').replace(/\r/g, '').replace(/\n/g, '');
            if (ckStr.indexOf(',') > -1) { cookies = ckStr.split(','); }
            else { cookies.push(ckStr); }
        }
    }

    for (let i = 0; i < cookies.length; i++) {
        console.log('\r\n★★★★★开始执行第' + (i + 1) + '个账号,共' + cookies.length + '个账号★★★★★');
        thisck = cookies[i];

        await sign();

        await $.wait(1000);

        await watering();

        await $.wait(1000);

        await treeInfo(i);
    }


})().catch(async (e) => {
    console.log('', '❌失败! 原因:' + e + '!', '');
}).finally(() => {
    $.done();
});

async function sign() {
    return new Promise(async resolve => {
        try {

            let option = urlTask('https://ug-fission.kuaishou.com/rest/n/darwin/orchard/sign/action', '{"dayNum":1}');
            await $.http.post(option).then(async response => {
                let data = JSON.parse(response.body);
                //console.log(response.body);
                if (data.result == 1) {
                    console.log('\n【签到】:' + data.data.toast);
                }
                else console.log('\n【签到】:' + data.error_msg);
                resolve();
            })
        } catch (error) {
            console.log('\n【浇水】:' + error);
            resolve();
        }
    })
}

async function watering() {
    return new Promise(async resolve => {
        try {
            let waterNum = 0, waterCount = 0;
            do {
                let option = urlTask('https://ug-fission.kuaishou.com/rest/n/darwin/orchard/water/watering', '{}');
                await $.http.post(option).then(async response => {
                    let data = JSON.parse(response.body);
                    //console.log(response.body);
                    if (data.result == 1) {
                        waterCount++;
                        waterNum = data.data.wateringCan.waterAmount;
                        console.log('\n【浇水】:第' + waterCount + '次浇水成功,剩余' + waterNum + '滴水!');
                    }
                    else {
                        waterNum = 0;
                        console.log('\n【浇水】:' + data.error_msg);
                    }
                })
                await $.wait(1000);
            } while (waterNum >= 10);

            resolve();
        } catch (error) {
            console.log('\n【浇水】:' + error);
            resolve();
        }
    })
}

async function treeInfo(i) {
    return new Promise(async resolve => {
        try {

            let option = urlTask('https://ug-fission.kuaishou.com/rest/n/darwin/orchard/overview', '{"layoutType":"4","hyId":"orchard","enableWK":"1","source":"neb_taskcenter_banner"}');
            await $.http.post(option).then(async response => {
                let data = JSON.parse(response.body);
                //console.log(response.body);
                if (data.result == 1) {
                    console.log('\n【果树信息】:' + data.data.treeInfo.progressText + ',当前阶段进度:' + (data.data.treeInfo.percent) * 100 + '%');
                    if ($.env.isNode) await notify.sendNotify('第' + (i + 1) + '个账号果树信息', data.data.treeInfo.progressText + ',当前阶段进度:' + (data.data.treeInfo.percent) * 100 + '%');
                }
                else console.log('\n【果树信息】:' + data.error_msg);
                resolve();
            })
        } catch (error) {
            console.log('\n【浇水】:' + error);
            resolve();
        }
    })
}


function urlTask(url, body) {
    let option = {
        url: url,
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Cookie': thisck,
            'Accept': 'application/json, text/plain, */*',
            'User-Agent': 'jdltapp;iPad;3.1.0;14.4;network/wifi;hasUPPay/0;pushNoticeIsOpen/0;lang/zh_CN;model/iPad7,5;addressid/;hasOCPay/0;appBuild/1017;supportBestPay/0;pv/4.14;apprpd/MyJD_Main;ref/MyJdMTAManager;psq/3;ads/;psn/956c074c769cd2eeab2e36fca24ad4c9e469751a|8;jdv/0|;adk/;app_device/IOS;pap/JA2020_3112531|3.1.0|IOS 14.4;Mozilla/5.0 (iPad; CPU OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1',
            'Accept-Language': 'zh-cn'
        },
        body: body
    };
    return option;
}


/*********************************** API *************************************/
function ENV() { const e = "undefined" != typeof $task, t = "undefined" != typeof $loon, s = "undefined" != typeof $httpClient && !t, i = "function" == typeof require && "undefined" != typeof $jsbox; return { isQX: e, isLoon: t, isSurge: s, isNode: "function" == typeof require && !i, isJSBox: i, isRequest: "undefined" != typeof $request, isScriptable: "undefined" != typeof importModule } } function HTTP(e = { baseURL: "" }) { const { isQX: t, isLoon: s, isSurge: i, isScriptable: n, isNode: o } = ENV(), r = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/; const u = {}; return ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"].forEach(l => u[l.toLowerCase()] = (u => (function (u, l) { l = "string" == typeof l ? { url: l } : l; const h = e.baseURL; h && !r.test(l.url || "") && (l.url = h ? h + l.url : l.url); const a = (l = { ...e, ...l }).timeout, c = { onRequest: () => { }, onResponse: e => e, onTimeout: () => { }, ...l.events }; let f, d; if (c.onRequest(u, l), t) f = $task.fetch({ method: u, ...l }); else if (s || i || o) f = new Promise((e, t) => { (o ? require("request") : $httpClient)[u.toLowerCase()](l, (s, i, n) => { s ? t(s) : e({ statusCode: i.status || i.statusCode, headers: i.headers, body: n }) }) }); else if (n) { const e = new Request(l.url); e.method = u, e.headers = l.headers, e.body = l.body, f = new Promise((t, s) => { e.loadString().then(s => { t({ statusCode: e.response.statusCode, headers: e.response.headers, body: s }) }).catch(e => s(e)) }) } const p = a ? new Promise((e, t) => { d = setTimeout(() => (c.onTimeout(), t(`${u} URL: ${l.url} exceeds the timeout ${a} ms`)), a) }) : null; return (p ? Promise.race([p, f]).then(e => (clearTimeout(d), e)) : f).then(e => c.onResponse(e)) })(l, u))), u } function API(e = "untitled", t = !1) { const { isQX: s, isLoon: i, isSurge: n, isNode: o, isJSBox: r, isScriptable: u } = ENV(); return new class { constructor(e, t) { this.name = e, this.debug = t, this.http = HTTP(), this.env = ENV(), this.node = (() => { if (o) { return { fs: require("fs") } } return null })(), this.initCache(); Promise.prototype.delay = function (e) { return this.then(function (t) { return ((e, t) => new Promise(function (s) { setTimeout(s.bind(null, t), e) }))(e, t) }) } } initCache() { if (s && (this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}")), (i || n) && (this.cache = JSON.parse($persistentStore.read(this.name) || "{}")), o) { let e = "root.json"; this.node.fs.existsSync(e) || this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.root = {}, e = `${this.name}.json`, this.node.fs.existsSync(e) ? this.cache = JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)) : (this.node.fs.writeFileSync(e, JSON.stringify({}), { flag: "wx" }, e => console.log(e)), this.cache = {}) } } persistCache() { const e = JSON.stringify(this.cache, null, 2); s && $prefs.setValueForKey(e, this.name), (i || n) && $persistentStore.write(e, this.name), o && (this.node.fs.writeFileSync(`${this.name}.json`, e, { flag: "w" }, e => console.log(e)), this.node.fs.writeFileSync("root.json", JSON.stringify(this.root, null, 2), { flag: "w" }, e => console.log(e))) } write(e, t) { if (this.log(`SET ${t}`), -1 !== t.indexOf("#")) { if (t = t.substr(1), n || i) return $persistentStore.write(e, t); if (s) return $prefs.setValueForKey(e, t); o && (this.root[t] = e) } else this.cache[t] = e; this.persistCache() } read(e) { return this.log(`READ ${e}`), -1 === e.indexOf("#") ? this.cache[e] : (e = e.substr(1), n || i ? $persistentStore.read(e) : s ? $prefs.valueForKey(e) : o ? this.root[e] : void 0) } delete(e) { if (this.log(`DELETE ${e}`), -1 !== e.indexOf("#")) { if (e = e.substr(1), n || i) return $persistentStore.write(null, e); if (s) return $prefs.removeValueForKey(e); o && delete this.root[e] } else delete this.cache[e]; this.persistCache() } notify(e, t = "", l = "", h = {}) { const a = h["open-url"], c = h["media-url"]; if (s && $notify(e, t, l, h), n && $notification.post(e, t, l + `${c ? "\n多媒体:" + c : ""}`, { url: a }), i) { let s = {}; a && (s.openUrl = a), c && (s.mediaUrl = c), "{}" === JSON.stringify(s) ? $notification.post(e, t, l) : $notification.post(e, t, l, s) } if (o || u) { const s = l + (a ? `\n点击跳转: ${a}` : "") + (c ? `\n多媒体: ${c}` : ""); if (r) { require("push").schedule({ title: e, body: (t ? t + "\n" : "") + s }) } else console.log(`${e}\n${t}\n${s}\n\n`) } } log(e) { this.debug && console.log(`[${this.name}] LOG: ${this.stringify(e)}`) } info(e) { console.log(`[${this.name}] INFO: ${this.stringify(e)}`) } error(e) { console.log(`[${this.name}] ERROR: ${this.stringify(e)}`) } wait(e) { return new Promise(t => setTimeout(t, e)) } done(e = {}) { console.log('done!'); s || i || n ? $done(e) : o && !r && "undefined" != typeof $context && ($context.headers = e.headers, $context.statusCode = e.statusCode, $context.body = e.body) } stringify(e) { if ("string" == typeof e || e instanceof String) return e; try { return JSON.stringify(e, null, 2) } catch (e) { return "[object Object]" } } }(e, t) }
/*****************************************************************************/