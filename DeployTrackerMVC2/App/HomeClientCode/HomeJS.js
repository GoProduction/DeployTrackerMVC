var array = [];

//Week calendar initialization
var dp = new DayPilot.Month("calendar");
dp.theme = "monthcalendartheme";
$.get("/api/DeployAPI", function (data) {
    dp.events.list = data.map(function (source) {
        return {
            id: source.depID,
            text: source.depFeature + " v" + source.depVersion,
            start: moment(source.depPlannedDate).format('YYYY-MM-DDTHH:mm:ss'),
            end: moment(source.depPlannedDate).format('YYYY-MM-DDTHH:mm:ss'),
            status: source.depStatus

        };
    });
    dp.update();
})

dp.eventMoveHandling = "Disabled";
dp.onBeforeEventRender = function (args) {
    var type = args.data.status;
    switch (type) {
        case "Queued":
            args.data.backColor = "-moz-linear-gradient(top, #4690ff 0%, #004ec3)";
            break;
        case "Deploying":
            args.data.backColor = "-moz-linear-gradient(top, #EDFF5A 0%, #F0FF00)";
            args.data.fontColor = "#000000";
            break;
        case "Failed":
            args.data.backColor = "-moz-linear-gradient(top, #FF4545 0%, #FF0000)";
            args.data.fontColor = "#000000";
            break;
        case "Completed":
            args.data.backColor = "-moz-linear-gradient(top, #5CFF51 0%, #0FEE00)";
            args.data.fontColor = "#FFFFFF";
            break;
    }
};
dp.init();

dp.onEventClicked = function (args) {
    var header = document.getElementById("modalHeader");
    var txtID = document.getElementById("txtID");
    var txtPlannedDate = document.getElementById("txtPlannedDate");
    var txtPlannedTime = document.getElementById("txtPlannedTime");
    var txtStatus = document.getElementById("txtStatus");
    var paramID = args.e.id();
    
    $.ajax({
        type: 'GET',
        url: "/api/DeployAPI",
        data: {
            depID: paramID
        },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $.each(data, function (i, item) {

                if (item.depID == paramID) {

                    header.innerText = item.depFeature + " v" + item.depVersion;
                    txtID.innerText = item.depID;
                    txtStatus.innerText = item.depStatus;
                    txtPlannedDate.innerText = moment(item.depPlannedDate).format("MMM DD YYYY");
                    txtPlannedTime.innerText = moment(item.depPlannedTime).format("LT");
                }
                
            });
            
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

    $('#recordModal').modal('show');
    //txtID.innerText = args.e.id();
    /*txtStatus.innerText = args.data.status;*/
    /*alert("clicked: " + args.e.id());*/
};

var previousDate = function () {

    $("#calendar").fadeOut('fast');
    dp.startDate = dp.startDate.addMonths(-1);
    $("#calendar").fadeIn('fast');
    dp.update();

    var monthTitle = document.getElementById("monthLabel");
    monthTitle.textContent = moment(dp.startDate.toString()).format('MMMM');

};

var nextDate = function () {

    $("#calendar").fadeOut('fast');
    dp.startDate = dp.startDate.addMonths(1);
    $("#calendar").fadeIn('fast');
    dp.update();

    var monthTitle = document.getElementById("monthLabel");
    monthTitle.textContent = moment(dp.startDate.toString()).format('MMMM');

}

$(document).ready(function () {
    var monthTitle = document.getElementById("monthLabel");
    monthTitle.innerText = moment(dp.startDate).format('MMMM');
});
