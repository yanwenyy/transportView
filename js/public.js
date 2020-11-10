//接口变量
const http_url = {
    formal_url: "http://222.222.237.187:9080/jinding-back/",//正式
    test_url: "http://59.110.54.1:8080/jinding-back/",//测试
    Socket_url: "ws://222.222.237.187:9080/jinding-back/imserver/",
    // Socket_url:"ws://59.110.54.1:8080/jinding-back/imserver/",
    url: "http://222.222.237.187:9080/jinding-back/"
};
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function ajax(url, data, succ) {
    // console.log(url);
    $.ajax({
        type: "POST",
        url: http_url.url + url,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=utf-8",
            // "Accept-Encoding":"gzip,deflate"
        },
        data: JSON.stringify(data),
        success: function (data) {
            if (data.code == "2") {
                // alert(data.des);
                // window.location.href = "../html/register-next.html"
            } else {
                succ(data);
            }

        },
        error: function () {
            console.log("程序出错,请重试");
        }
    })
}

function ajax_get(url, succ) {
    // console.log(url);
    $.ajax({
        type: "GET",
        url: http_url.url + url,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=utf-8",
            // "token":""
        },
        success: function (data) {
            if (data.code == "2") {
                // alert(data.des);
                // window.location.href = "../html/register-next.html"
            } else {
                succ(data);
            }

        },
        error: function () {
            console.log("程序出错,请重试");
        }
    })
}

function ajax_nodata(url, succ) {
    $.ajax({
        type: "POST",
        url: http_url.url + url,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=utf-8",
            // "Accept-Encoding":"gzip,deflate"
        },
        success: function (data) {
            if (data.code == "2") {
                // window.location.href = "../html/register-next.html"
            } else {
                succ(data);
            }
        },
        error: function () {
            console.log("程序出错,请重试");
        }
    })
}

function PxSocket(options) {
    this.options = options;
    this.ws = null;
    this.timeout=options.heartTime||50000;
    this.timeoutObj=null;
    this.serverTimeoutObj=null;
}

PxSocket.prototype = {
    connect: function () {
        var _this = this;
        try {
            if ('WebSocket' in window) {
                // console.log(_this.options.url + _this.options.data)
                _this.ws = new WebSocket(_this.options.url + _this.options.data);
                // console.log( _this.ws)
                // console.log(http_url.Socket_url+options.id)
            } else {
                alert("您的浏览器不支持websocket");
            }
            _this.ws.onerror = function () {
                _this.reconnect(_this.ws);
                console.log("send error！");
            };
            _this.ws.onopen = function () {

                _this.heartCheck();      //心跳检测重置
                // console.log(_this.options.name +"  "+ new Date().toUTCString());
                console.log("connection success！")
            };
            _this.ws.onmessage = function (event) {
                _this.heartCheck();      //拿到任何消息都说明当前连接是正常的
                // console.log("llws收到消息啦:" + event.data);
                console.log(event.data)
                if (event.data == 'pong') {
                    _this.options.succ(event.data);
                } else {
                    console.log(_this.options.name + " is " + event.data);
                }
            };
            _this.ws.onclose = function () {
                _this.reconnect(_this.ws);
                console.log(_this.options.name +" closed websockettttttt!")
            }
        } catch (e){
            _this.reconnect(_this.ws);

        }
        return _this;
    },
    reconnect: function () {
        var _this=this,
            lockReconnect = false;
        if (lockReconnect) return;
        lockReconnect = true;
        setTimeout(function () {     //没连接上会一直重连，设置延迟避免请求过多
            _this.connect();
            lockReconnect = false;
        }, 2000);
    },
    heartCheck: function () {
        var self = this;
        clearTimeout(self.timeoutObj);
        clearTimeout(self.serverTimeoutObj);
        self.timeoutObj = setTimeout(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            self.ws.send("ping");
            // console.log("ping!");
            self.serverTimeoutObj = setTimeout(function () {//如果超过一定时间还没重置，说明后端主动断开了
                self.ws.close();     //如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
            }, self.timeout)
        }, this.timeout)
    },
    close: function () {
        this.ws.close(3000, "强制关闭");
    }
}

function randomString(len) {
    len = len || 32;
    let timestamp = new Date().getTime();
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let maxPos = $chars.length;
    let randomStr = '';
    for (let i = 0; i < len; i++) {
        randomStr += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return randomStr + timestamp;
}

//删除数组内某项的构造函数
Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

// 图片转base64
function getBase64(file) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function () {
            imgResult = reader.result
        }
        reader.onerror = function (error) {
            reject(error)
        }
        reader.onloadend = function () {
            resolve(imgResult)
        }
    })
};

//比较日期大小
function CompareDate(date1,date2){
    console.log(date1,date2)
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    if(oDate1.getTime() > oDate2.getTime()){
        return false;
    } else {
        return true;
    }
}