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
    /*ID declaration*/
    var paramID = args.e.id();
    paramID.toString();
    /*HTML elements for deploy details*/
    var header = document.getElementById("modalHeader");
    var txtID = document.getElementById("txtID");
    var txtEnvironment = document.getElementById("txtEnvironment");
    var txtPlannedDate = document.getElementById("txtPlannedDate");
    var txtPlannedTime = document.getElementById("txtPlannedTime");
    var txtStartTime = document.getElementById("txtStartTime");
    var txtEndTime = document.getElementById("txtEndTime");
    var txtStatus = document.getElementById("txtStatus");
    var txtComment = document.getElementById("txtComment");
    
    /*Declare divs for visibility of StartTime, EndTime, & Comments*/
    var divStart = document.getElementById("divStart");
    var divEnd = document.getElementById("divEnd");
    var divComment = document.getElementById("divComment");
    var divCommentless = document.getElementById("divCommentless");

    /*GET for tblDeploys*/    
    $.ajax({
        type: 'GET',
        url: "/api/DeployAPI/deployByID",
        data: { depID: paramID },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {

            header.innerText = data.depFeature + " v" + data.depVersion;
            txtID.innerText = data.depID;
            txtEnvironment.innerText = data.depEnvironment;
            txtPlannedDate.innerText = moment(data.depPlannedDate).format("MMM DD YYYY");
            txtPlannedTime.innerText = moment(data.depPlannedTime).format("LT");
            txtStartTime.innerText = moment(data.depStartTime).format("LT");
            txtEndTime.innerText = moment(data.depEndTime).format("LT");
            txtStatus.innerText = data.depStatus;

            if (data.depStatus == "Queued") {
                divStart.style.display = "none";
                divEnd.style.display = "none";
            }
            else if (data.depStatus == "Deploying") {
                divStart.style.display = "block";
                divEnd.style.display = "none";
            }
            else {
                divStart.style.display = "block";
                divEnd.style.display = "block";
            }
        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

    /*GET for tblComments*/
    $.ajax({
        type: 'GET',
        url: "/api/CommentAPI",
        data: { depID: paramID },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            $.each(data, function (i, item) {

                if (item.depID == paramID) {

                    txtComment.innerHTML = item.comBody;
                    divComment.style.display = "block";
                    divCommentless.style.display = "none";

                }
                else {
                    divComment.style.display = "none";
                    divCommentless.style.display = "block";
                }

            });

        },
        error: function (xhr) {
            console.log(xhr);
        }
    });

    $('#recordModal').modal('show');
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
