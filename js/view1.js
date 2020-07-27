$(function () {
    var noImgPage=10,
        imgPage=5;
    $("#page1").paging({
            total: 10,
            numberPage: 5
        },
        function(msg) {
            //回调函数 msg为选中页码
            console.log(msg)
        });
    $(".tab2>div").click(function () {
        $(".tab2>div").removeClass("tab-list-act");
        $(this).addClass("tab-list-act");
        var that=$(this),
            msg=that.attr("data-msg"),
            i=0,html='';
        for(;i<5;i++){
            html+=`
               <tr>
                                <td>${msg}</td>
                                <td>2020 19:20</td>
                                <td>2020 19:20</td>
                                <td>4444</td>
                                <td>物料1</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                                <td>122333333</td>
                                <td>发货</td>
                                <td>北京</td>
                                <td>北京</td>
                                <td>5555</td>
                                <td>55555</td>
                                <td>发出</td>
                                <td>湖北</td>
                                <td>2020 19:20</td>
                                <td>2020 19:20</td>
                                <td>正常</td>
                                <td><img class="table-img" src="../img/test.jpg" alt=""></td>
                            </tr>
            `
        }
        $("#table2 tbody").html(html);
    });
    $(".tab3>div").click(function () {
        $(".tab2>div").removeClass("tab-list-act");
        $(this).addClass("tab-list-act");
        var that=$(this),
            msg=that.attr("data-msg"),
            i=0,html='';
        for(;i<7;i++){
            html+=`<tr>
                                    <td>${msg}</td>
                                    <td>2020 19:20</td>
                                    <td>3333</td>
                                    <td>正常</td>
                                    <td>555</td>
                                </tr>`
        }
        $("#table3 tbody").html(html);
    });
    //图片预览
    $("body").on("click",".table-img",function () {
        var src=$(this).attr("src");
        $(".img-pre>img").attr("src",src);
        $(".img-pre").removeClass("out");
    });
    $(".img-pre").click(function () {
        $(this).addClass("out");
    });

    //场内运输
    ajax_get("jinding/factory/car/list?pageNum=1&pageSize="+noImgPage+"&evnCarNum=&registTime=", function (data) {
        $("#factoryPage").paging({
                total: data.total,
                numberPage: noImgPage
            },
            function(msg) {
                //回调函数 msg为选中页码
                ajax_get("jinding/factory/car/list?pageNum="+msg+"&pageSize="+noImgPage+"&evnCarNum=&registTime=", function (data) {
                    factory(data)
                });
            });
        factory(data)
    });
    function factory(data) {
        var list=data.data,i=0,len=list.length,html='';
        for(;i<len;i++){
            var v=list[i];
            html+=' <tr>\n' +
                '<td>'+v.evnCarNum+'</td>\n' +
                '<td>'+v.registTime+'</td>\n' +
                '<td>'+v.vehicleNum+'</td>\n' +
                '<td>'+v.engineNum+'</td>\n' +
                '<td>'+v.emissionStand+'</td>\n' +
                '<td><img title="点击查看大图" class="table-img" src="'+(http_url.url+'/jinding/showImg/'+v.carCheckList)+'" alt=""></td>\n' +
                '<td><img title="点击查看大图" class="table-img" src="'+(http_url.url+'/jinding/showImg/'+v.drivinglLicense)+'" alt=""></td>\n' +
                '</tr>'
        }
        $(".factoryData").html(html)
    }

    //非道路移动机械电子台账
    ajax_get("/jinding/offroad/list?pageNum=1&pageSize="+noImgPage+"&produceTime=&evnProNum=", function (data) {
        $("#offroadPage").paging({
                total: data.total,
                numberPage: noImgPage
            },
            function(msg) {
                //回调函数 msg为选中页码
                ajax_get("/jinding/offroad/list?pageNum="+msg+"&pageSize="+noImgPage+"&produceTime=&evnProNum=", function (data) {
                    offroad(data)
                });
            });
        offroad(data)
    });
    function offroad(data) {
        var list=data.data,i=0,len=list.length,html='';
        for(;i<len;i++){
            var v=list[i];
            html+=' <tr>\n' +
                '<td>'+v.evnProNum+'</td>\n' +
                '<td>'+v.produceTime+'</td>\n' +
                '<td>'+v.emission+'</td>\n' +
                '<td>'+v.emissionNum+'</td>\n' +
                '<td>'+v.engineNum+'</td>\n' +
                '</tr>'
        }
        $(".offroadData").html(html)
    }

    //汇总表
    ajax_get("/jinding/sum/list?pageNum=1&pageSize="+noImgPage+"&monthTime=&dayTime=&materialsName=", function (data) {
        $("#totalPage").paging({
                total: 10,
                numberPage: noImgPage
            },
            function(msg) {
                ajax_get("/jinding/sum/list?pageNum="+msg+"&pageSize="+noImgPage+"&monthTime=&dayTime=&materialsName=", function (data) {
                    total(data)
                });
            });
        total(data)
    });
    function total(data){
        var list=data.data,i=0,len=list.length,html='';
        for(;i<len;i++){
            var v=list[i];
            html+=' <tr>\n' +
                '<td>'+(v.materialsName||'')+'</td>\n' +
                '<td>'+v.carWeigh+'</td>\n' +
                '<td>'+(v.sumWeigh-v.carWeigh)+'</td>\n' +
                '<td>'+v.sumWeigh+'</td>\n' +
                '<td>'+((v.sumWeigh-v.carWeigh)/ v.sumWeigh).toFixed(2)*100+'%'+'</td>\n' +
                '</tr>'
        }
        $(".totalData").html(html)
    }
});