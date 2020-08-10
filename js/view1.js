$(function () {
    var noImgPage=10,
        imgPage=5,
        vehicle={},//运输车辆
        venueVehicle={},//场内运输
        nrmm={},//非道路机械
        summary={},//汇总
        externalVehicle={};//外部运输
    //图片预览
    $("body").on("click",".table-img",function () {
        var src=$(this).attr("src");
        $(".img-pre>img").attr("src",src);
        $(".img-pre").removeClass("out");
        document.body.style.overflow='hidden';
        document.body.style.height='100%';
    });
    $("body").on("mousewheel",".img-pre>img",function (e) {
        var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
            (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox
        if (delta > 0) {
            // 向上滚
            $(this).css("max-width",'100%');
            $(this).width($(this).width()*1.1);
        } else if (delta < 0) {
            // 向下滚
            $(this).width($(this).width()*0.8);
        }
    });
    var current=0,zoom=1;
    $(".img-pre>img").click(function () {
        $(".img-pre").addClass("out");
        $(".img-pre>img").css("max-width",'60%').css("transform","rotate(0deg)scale(1,1)");
        document.body.style.overflow='auto';
        document.body.style.height='auto';
        current=0;zoom=1;
    });
    $(".translate").click(function () {
        current = (current+90)%360;
        $(".img-pre>img").css("transform","rotate("+current+"deg)scale("+zoom,+","+zoom+")");
    });
    $(".big").click(function () {
        zoom += 0.1;
        $(".img-pre>img").css("transform","rotate("+current+"deg)scale("+zoom,+","+zoom+")");
    });
    $(".small").click(function () {
        zoom -= 0.1;
        $(".img-pre>img").css("transform","rotate("+current+"deg)scale("+zoom,+","+zoom+")");
    });
    $(".close-pre").click(function () {
        $(".img-pre").addClass("out");
        $(".img-pre>img").css("max-width",'60%').css("transform","rotate(0deg)scale(1,1)");
        document.body.style.overflow='auto';
        document.body.style.height='auto';
        current=0;zoom=1;
    });

    var num="_"+randomString();
    var ws1=new PxSocket({
        url:http_url.Socket_url,
        name:'getData',
        data:'jinding'+num,
        succ:timeCar
    });
    ws1.connect();
    window.onbeforeunload = function () {
        ws1.close();
    };

    timeCar();
    timeFactory();
    timeOffroad();
    timeTotal();

    //车辆运输
    function timeCar() {
        vehicle={
            timeStart:$('.vehicle-timeStart').val()||'',
            timeEnd:$('.vehicle-timeEnd').val()||'',
            fuelType:$('.vehicle-fuelType').val()||'',
            emissionStand:$('.vehicle-emissionStand').val()||'',
            materialsName:$('.vehicle-materialsName').val()||'',
            tranType:$('.vehicle-tranType').val()||''
        };
        ajax_get("jinding/tran/list?pageNum=1&pageSize="+imgPage+"&timeStart="+vehicle.timeStart+"&timeEnd="+vehicle.timeEnd+"&carNum=&materialsName="+vehicle.materialsName+"&doorPostName=&poundRoom=&containerNum=&tranType="+vehicle.tranType+"&emissionStand="+vehicle.emissionStand+"&fuelType="+vehicle.fuelType, function (data) {
            $("#tranPage").paging({
                    total: data.total,
                    numberPage: imgPage
                },
                function(msg) {
                    //回调函数 msg为选中页码
                    ajax_get("jinding/tran/list?pageNum="+msg+"&pageSize="+imgPage+"&enterTime=&outFactoryTime=&carNum=&materialsName=&doorPostName=&poundRoom=&containerNum&=tranType=&emissionStand=&fuelType=", function (data) {
                        tran(data)
                    });
                });
            tran(data)
        });
        function tran(data) {
            var list=data.data,i=0,len=list.length,html='';
            for(;i<len;i++){
                var v=list[i];
                html+=' <tr>\n' +
                    '<td>'+(v.enterTime||'')+'</td>\n' +
                    '<td>'+(v.outFactoryTime||'')+'</td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="" alt=""></td>\n' +
                    '<td>'+(v.carNum||'')+'</td>\n' +
                    '<td>'+(v.registTime&&v.registTime.split(" ")[0]||'')+'</td>\n' +
                    '<td>'+(v.vehicleNum||'')+'</td>\n' +
                    '<td>'+(v.engineNum||'')+'</td>\n' +
                    '<td>'+(v.fuelType||'')+'</td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.carCheckList&&v.carCheckList.indexOf('http')!=-1?v.carCheckList:v.carCheckList?http_url.url+'/jinding/showImg/'+v.carCheckList:'')+'" alt=""></td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.drivinglLicense&&v.drivinglLicense.indexOf('http')!=-1?v.drivinglLicense:v.drivinglLicense?http_url.url+'/jinding/showImg/'+v.drivinglLicense:'')+'" alt=""></td>\n' +
                    '<td>'+(v.doorEmissionStand||'')+'</td>\n' +
                    '<td>'+(v.materialsName||'')+'</td>\n' +
                    '<td>'+(v.netWeigh||'')+'</td>\n' +
                    '<td>'+(v.tranType==1?'公路':'铁路')+'</td>\n' +
                    '<td>'+(v.transportUnit||'')+'</td>\n' +
                    '</tr>'
            }
            $(".tranData").html(html)
        }
    }
    //场内运输
    function timeFactory(){
        venueVehicle={
            registTime:$('.venueVehicle-registTime').val()||'',
            evnCarNum:$('.venueVehicle-evnCarNum').val()||''
        };
        ajax_get("jinding/factory/car/list?pageNum=1&pageSize="+noImgPage+"&evnCarNum="+venueVehicle.evnCarNum+"&registTime="+venueVehicle.registTime, function (data) {
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
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.carCheckList&&v.carCheckList.indexOf('http')!=-1?v.carCheckList:v.carCheckList?http_url.url+'/jinding/showImg/'+v.carCheckList:'')+'" alt=""></td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.drivinglLicense&&v.drivinglLicense.indexOf('http')!=-1?v.drivinglLicense:v.drivinglLicense?http_url.url+'/jinding/showImg/'+v.drivinglLicense:'')+'" alt=""></td>\n' +
                    '</tr>'
            }
            $(".factoryData").html(html)
        }
    }
    //非道路移动机械电子台账
    function timeOffroad(){
        nrmm={
            produceTime:$('.nrmm-produceTime').val()||'',
            evnProNum:$('.nrmm-evnProNum').val()||''
        };
        ajax_get("/jinding/offroad/list?pageNum=1&pageSize="+noImgPage+"&produceTime="+nrmm.produceTime+"&evnProNum="+nrmm.evnProNum, function (data) {
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
    }
    //汇总表
    function timeTotal(){
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
                    '<td>'+(v.sumWeigh||0)+'</td>\n' +
                    '<td>'+((v.sumWeigh-v.carWeigh)/ v.sumWeigh).toFixed(2)*100+'%'+'</td>\n' +
                    '</tr>'
            }
            $(".totalData").html(html)
        }
    }

    $(".search-btn").click(function () {
        var msg=$(this).attr("data-msg");
        if(msg=='timeCar'){
            timeCar();
        }else if(msg=='timeFactory'){
            timeFactory();
        }else if(msg=='timeOffroad'){
            timeOffroad();
        }else if(msg=='timeTotal'){
            timeTotal();
        }
    })
});
