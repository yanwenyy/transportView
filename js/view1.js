$(function () {
    var noImgPage=10,
        imgPage=10,
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
        $(".img-pre>img").css("max-width",'60%').css("transform","rotate(0deg)scale(1,1)").css("width",'auto');
        document.body.style.overflow='auto';
        document.body.style.height='auto';
        current=0;zoom=1;
    });

    // var num="_"+randomString();
    // var ws1=new PxSocket({
    //     url:http_url.Socket_url,
    //     name:'getData',
    //     data:'jinding'+num,
    //     succ:timeCar
    // });
    // ws1.connect();
    // window.onbeforeunload = function () {
    //     ws1.close();
    // };
    setInterval(function () {
        timeCar();
        console.log("刷新了")
    }, 600000);

    timeCar();
    timeFactory();
    timeOffroad();
    timeTotal();
    timeOutCar();
    //车辆运输
    function timeCar() {
        vehicle={
            timeStart:$('.vehicle-timeStart').val()||'',
            timeEnd:$('.vehicle-timeEnd').val()||'',
            fuelType:$('.vehicle-fuelType').val()||'',
            emissionStand:$('.vehicle-emissionStand').val()||'',
            materialsName:$('.vehicle-materialsName').val()||'',
            tranType:$('.vehicle-tranType').val()||'',
            materialsPname:$(".vehicle-materialsPname").val()||'',
            carPageNum:1
        };
        ajax_get("jinding/tran/list?pageNum="+vehicle.carPageNum+"&pageSize="+imgPage+"&timeStart="+vehicle.timeStart+"&timeEnd="+vehicle.timeEnd+"&carNum=&materialsName="+vehicle.materialsName+"&doorPostName=&poundRoom=&containerNum=&tranType="+vehicle.tranType+"&emissionStand="+vehicle.emissionStand+"&fuelType="+vehicle.fuelType+"&materialsPname="+vehicle.materialsPname, function (data) {
            $("#tranPage").paging({
                    total: data.total,
                    numberPage: imgPage,
                    currentPage:vehicle.carPageNum
                },
                function(msg) {
                    vehicle.carPageNum=msg;
                    //回调函数 msg为选中页码
                    ajax_get("jinding/tran/list?pageNum="+vehicle.carPageNum+"&pageSize="+imgPage+"&timeStart="+vehicle.timeStart+"&timeEnd="+vehicle.timeEnd+"&carNum=&materialsName="+vehicle.materialsName+"&doorPostName=&poundRoom=&containerNum=&tranType="+vehicle.tranType+"&emissionStand="+vehicle.emissionStand+"&fuelType="+vehicle.fuelType, function (data) {
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
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.poundImg&&v.poundImg.indexOf('http')!=-1?v.poundImg:v.poundImg?http_url.url+'/jinding/showImg/'+v.poundImg:'')+'" alt=""></td>\n' +
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
                    '<td>'+(v.tranType==1?'公路':v.tranType==0?'铁路':v.tranType==2?'纯电动':'')+'</td>\n' +
                    '<td>'+(v.owner||'')+'</td>\n' +
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
        summary={
            timeStart:$('.summary-timeStart').val()||'',
            timeEnd:$('.summary-timeEnd').val()||'',
            meaType:$('.summary-meaType').val()||'',
            materialsPname:$('.summary-materialsPname').val()||'',
            tranType:$('.summary-tranType').val()||'',
            emissionStand:$('.summary-emissionStand').val()||'',
            materialsName:$('.summary-materialsName').val()||''
        };
        ajax_get("jinding/sum/list/two?pageNum=1&pageSize="+noImgPage+"&timeStart="+summary.timeStart+"&timeEnd="+summary.timeEnd+"&meaType="+summary.meaType+"&materialsPname="+summary.materialsPname+"&tranType="+summary.tranType+"&emissionStand="+summary.emissionStand+"&materialsName="+summary.materialsName, function (data) {
            $("#totalPage").paging({
                    total:  data.total,
                    numberPage: noImgPage
                },
                function(msg) {
                    ajax_get("jinding/sum/list/two?pageNum="+msg+"&pageSize="+noImgPage+"&timeStart="+summary.timeStart+"&timeEnd="+summary.timeEnd+"&meaType="+summary.meaType+"&materialsPname="+summary.materialsPname+"&tranType="+summary.tranType+"&emissionStand="+summary.emissionStand+"&materialsName="+summary.materialsName, function (data) {
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
                    '<td>'+(v.measureType&&(v.measureType==1?'采购 ':'销售'))+'</td>\n' +
                    '<td>'+(v.materialsPname||'')+'</td>\n' +
                    '<td>'+(v.materialsName||'')+'</td>\n' +
                    '<td>'+(v.trainNum)+'</td>\n' +
                    '<td>'+(v.trainWeigh==0||v.trainWeigh%1==0?v.trainWeigh:v.trainWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.electNum)+'</td>\n' +
                    '<td>'+(v.electWeigh==0||v.electWeigh%1==0?v.electWeigh:v.electWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.carNum)+'</td>\n' +
                    '<td>'+(v.carWeigh==0||v.carWeigh%1==0?v.carWeigh:v.carWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.percentage%1===0?v.percentage*100+'%':(v.percentage*100).toFixed(2)+'%')+'</td>\n' +
                    '</tr>'
            }
            $(".totalData").html(html);
            autoRowSpan('newSummary',1,1);
            autoRowSpan('newSummary',1,0);
        }
        //汇总合计
        ajax_get("jinding/sum/list/count?timeStart="+summary.timeStart+"&timeEnd="+summary.timeEnd, function (data) {
            var list=data.data,i=0,len=list.length,html='';
            for(;i<len;i++){
                var v=list[i];
                html+=' <tr>\n' +
                    '<td>'+(v.measureType&&(v.measureType==1?'采购 ':v.measureType==2?'销售 ':'采购+销售'))+'</td>\n' +
                    '<td>'+(v.trainWeigh==0||v.trainWeigh%1==0?v.trainWeigh:v.trainWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.electWeigh==0||v.electWeigh%1==0?v.electWeigh:v.electWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.carWeigh==0||v.carWeigh%1==0?v.carWeigh:v.carWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.sumWeigh==0||v.sumWeigh%1==0?v.sumWeigh:v.sumWeigh.toFixed(2))+'</td>\n' +
                    '<td>'+(v.percentage%1===0?v.percentage*100+'%':(v.percentage*100).toFixed(2)+'%')+'</td>\n' +
                    '</tr>'
            }
            $(".hj").html(html);
        });
    }

    //外部车辆
    function timeOutCar() {
        externalVehicle={
            timeStart:$('.externalVehicle-timeStart').val()||'',
            timeEnd:$('.externalVehicle-timeEnd').val()||'',
            fuelType:$('.externalVehicle-fuelType').val()||'',
            emissionStand:$('.externalVehicle-emissionStand').val()||'',
        };
        ajax_get("jinding/outcar/list?pageNum=1&pageSize="+imgPage+"&timeStart="+externalVehicle.timeStart+"&timeEnd="+externalVehicle.timeEnd+"&fuelType="+externalVehicle.fuelType+"&emissionStand="+externalVehicle.emissionStand, function (data) {
            $("#outTranPage").paging({
                    total: data.total,
                    numberPage: imgPage
                },
                function(msg) {
                    //回调函数 msg为选中页码
                    ajax_get("jinding/outcar/list?pageNum="+msg+"&pageSize="+imgPage+"&timeStart="+externalVehicle.timeStart+"&timeEnd="+externalVehicle.timeEnd+"&fuelType="+externalVehicle.fuelType+"&emissionStand="+externalVehicle.emissionStand, function (data) {
                        outTran(data)
                    });
                });
            outTran(data)
        });
        function outTran(data) {
            var list=data.data,i=0,len=list.length,html='';
            for(;i<len;i++){
                var v=list[i];
                html+=' <tr>\n' +
                    '<td>'+(v.carNum||'')+'</td>\n' +
                    '<td>'+(v.registTime&&v.registTime.split(" ")[0]||'')+'</td>\n' +
                    '<td>'+(v.vehicleNum||'')+'</td>\n' +
                    '<td>'+(v.engineNum||'')+'</td>\n' +
                    '<td>'+(v.doorEmissionStand||'')+'</td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.carCheckList&&v.carCheckList.indexOf('http')!=-1?v.carCheckList:v.carCheckList?http_url.url+'/jinding/showImg/'+v.carCheckList:'')+'" alt=""></td>\n' +
                    '<td>'+(v.fuelType||'')+'</td>\n' +
                    '<td><img title="点击查看大图" class="table-img" src="'+(v.drivinglLicense&&v.drivinglLicense.indexOf('http')!=-1?v.drivinglLicense:v.drivinglLicense?http_url.url+'/jinding/showImg/'+v.drivinglLicense:'')+'" alt=""></td>\n' +
                    '</tr>'
            }
            $(".outTranData").html(html)
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
        }else if(msg=='timeOutCar'){
            timeOutCar();
        }
    });

    //合并单元格
    function autoRowSpan(tb,row,col){
        var lastValue="";
        var value="";
        var pos=1;
        var list=document.getElementById(tb).rows,
            len=list.length,
            i=row;
        for(;i<len;i++){
            value = list[i].cells[col].innerText;
            if(lastValue == value){
                list[i].deleteCell(col);
                list[i-pos].cells[col].rowSpan = list[i-pos].cells[col].rowSpan+1;
                pos++;
            }else{
                lastValue = value;
                pos=1;
            }
        }
    }
});
