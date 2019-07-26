var objstatus = '';
var selID = '';

var DeployViewModel = function (deploySignalR) {

    var self = this;

    //OBSERVABLE ARRAYS////////////////////////////////////////////////////////
    self.deploy = ko.observableArray(); // Deploy observable array that will be called through HTML
    self.feature = ko.observableArray(); // Feature observable array that will be used to populate feature drop-down
    self.environment = ko.observableArray(); // Environment observable array that will be used to populate environment drop-down
    self.status = ko.observableArray([
        { tmpStatus: "Queued" },
        { tmpStatus: "Deploying" },
        { tmpStatus: "Completed" },
        { tmpStatus: "Failed" }

    ]); // Status observable array
    self.comment = ko.observableArray(); // Comment observable array
    self.selected = ko.observableArray(self.deploy()[0]); //Determines if record is selected

    //ObSERVABLES///////////////////////////////////////////////////////////
    self.obsCheckEdit = ko.observable(0); // Observable that is used to check if any field is being edited
    self.loading = ko.observable(true); // Loading function that triggers the loading animation
    self.obsID = ko.observable(''); // Observable that is used to filter any results by ID

    //FUNCTIONS///////////////////////////////////////////////////////////
    self.dateAndUser = function (date, user) {
        return moment(date, 'MMM DD YYYY') + " " + user;
    }
    self.selectRecord = function (data) {

        self.selected(data);
        selID = self.selected().depID;
        self.obsID(selID);
        console.log("obsID: ");
        console.log(self.obsID);
        console.log("selID: ");
        console.log(selID);
        openNav();

    }; // Run when record is selected, and open the record modal
    self.displayModeQ = function (deploy) {
        if (deploy.depLocked()) {
            console.log('Locked row');
            return 'locked-template-q';
        }
        else {
            return deploy.Edit() ? 'edit-template-q' : 'read-template-q';
        }
    } // Changes the display mode of a table when a client is editing a row in the QUEUED table
    self.displayModeC = function (deploy) {
        if (deploy.depLocked()) {
            console.log('Locked row');
            return 'locked-template-c';
        }
        else {
            return deploy.Edit() ? 'edit-template-c' : 'read-template-c';
        }
    } // Changes the display mode of a table when a client is editing a row in the CURRENT table
    self.updateViewModel = function () {
        try {
            $.getJSON('/odata/Deploys', function (data) {
                self.deploy(ko.utils.arrayMap(data.value, function (deploy) {
                    var obsDeploy = {
                        depID: deploy.depID,
                        depFeature: ko.observable(deploy.depFeature),
                        depVersion: ko.observable(deploy.depVersion),
                        depEnvironment: ko.observable(deploy.depEnvironment),
                        depPlannedDate: ko.observable(deploy.depPlannedDate),
                        depPlannedTime: ko.observable(new Date(deploy.depPlannedTime)),
                        depStartTime: ko.observable(deploy.depStartTime),
                        depEndTime: ko.observable(deploy.depEndTime),
                        depStatus: ko.observable(deploy.depStatus),
                        Edit: ko.observable(false),
                        depLocked: ko.observable(deploy.depLocked)

                    }

                    self.watchModel(obsDeploy, self.modelChanged);
                    console.log("Updated deploys...");
                    return obsDeploy;
                }));

            });
        }
        catch (err) {
            errorToast(err);
        }
    } // Updates the viewmodel when new DEPLOYS have been submitted
    self.updateViewModelComment = function () {
        try {
            $.getJSON('/odata/Comments', function (data) {
                self.comment(ko.utils.arrayMap(data.value, function (comment) {
                    var obsComment = {
                        comID: comment.comID,
                        comBody: ko.observable(comment.comBody),
                        comDateTime: ko.observable(new Date(comment.comDateTime)),
                        comUser: ko.observable(comment.comUser),
                        depID: ko.observable(comment.depID)
                    }

                    self.watchModel(obsComment, self.modelChanged);
                    console.log("Updated comments...");
                    return obsComment;
                }));

            });
        }
        catch (err) {
            errorToast(err);
        }
    } // Updates the viewmodel when new COMMENT has been submitted
    self.edit = function (deploy) {
        self.obsCheckEdit(self.obsCheckEdit() + 1);
        deploy.Edit(true);
        console.log('Edit triggered...');
        deploySignalR.server.lock(deploy.depID);

    } // Function to enable the edit-template, AND trigger the signalr LOCK event for all other clients
    self.done = function (deploy) {
        self.obsCheckEdit(self.obsCheckEdit() - 1);
        deploy.Edit(false);
        deploySignalR.server.unlock(deploy.depID);
    } // Function to disable the 'LOCKED' status of the row
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key]) && key != 'Edit' && key != 'depLocked') {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                });
            }
        }
    } // Checks to make sure properties are observable
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            callback(key, val);
        });
    } // Subscribes to observable objects, and listens for changes

    //modelChanged function, to trigger when a row value changes (with jQuery PATCH request)
    //PATCH request will only send the changed property to the database, minimizing network traffic
    self.modelChanged = function (model, key, val) {

        //Wrote this function to deal with the PATCH request firing after moving through the time field. The HTML
        //time field will prematurely fire when moving through hh->mm parts of the field, causing the datetime
        //value to become invalid. This function tells the patch request to fire after the field has lost focus.
        if ($("#ctlPlannedTime").is(":focus")) {
            console.log('Time field has the focus')
            $("#ctlPlannedTime").blur(function () {
                var payload = {};
                payload[key] = val;

                $.ajax({
                    url: '/odata/Deploys(' + model.depID + ')',
                    type: 'PATCH',
                    data: JSON.stringify(payload),
                    contentType: 'application/json',
                    dataType: 'json'
                });
                return;
            })
        }

        else {

            var payload = {};
            payload[key] = val;
            $.ajax({
                url: '/odata/Deploys(' + model.depID + ')',
                type: 'PATCH',
                data: JSON.stringify(payload),
                contentType: 'application/json',
                dataType: 'json'
            });
        }
    }

    //GET REQUESTS///////////////////////////////////////////////////////
    $.getJSON('/odata/Deploys', function (data) {
        self.deploy(ko.utils.arrayMap(data.value, function (deploy) {
            var obsDeploy = {
                depID: deploy.depID,
                depFeature: ko.observable(deploy.depFeature),
                depVersion: ko.observable(deploy.depVersion),
                depEnvironment: ko.observable(deploy.depEnvironment),
                depPlannedDate: ko.observable(deploy.depPlannedDate),
                depPlannedTime: ko.observable(deploy.depPlannedTime),
                depStartTime: ko.observable(deploy.depStartTime),
                depEndTime: ko.observable(deploy.depEndTime),
                depStatus: ko.observable(deploy.depStatus),
                Edit: ko.observable(false),
                depLocked: ko.observable(deploy.depLocked)

            }

            self.watchModel(obsDeploy, self.modelChanged);
            return obsDeploy;
        }));
        self.loading(false);
    }); // Fetches data from Deploys table
    $.getJSON('/odata/Features', function (data) {
        self.feature(ko.utils.arrayMap(data.value, function (feature) {
            var obsFeature = {
                feaID: feature.feaID,
                feaName: ko.observable(feature.feaName)
            }

            return obsFeature;
        }));
    }); // Fetches data from Features table
    $.getJSON('/odata/Environments', function (data) {
        self.environment(ko.utils.arrayMap(data.value, function (environment) {
            var obsEnvironment = {
                envID: environment.envID,
                envName: ko.observable(environment.envName)
            }

            return obsEnvironment;
        }));
    }); // Featches data from Environments table
    $.getJSON('/odata/Comments', function (data) {
        self.comment(ko.utils.arrayMap(data.value, function (comment) {
            var obsComment = {
                comID: comment.comID,
                comBody: ko.observable(comment.comBody),
                comDateTime: ko.observable(new Date(comment.comDateTime)),
                comUser: ko.observable(comment.comUser),
                depID: ko.observable(comment.depID)
            }

            return obsComment;
        }));
    }); // Featches data from Comments table

    ///TABLE FILTERS////////////////////////////////////////////////////
    self.queuedDeploys = ko.computed(function () {
        return ko.utils.arrayFilter(self.deploy(), function (rec) {
            return rec.depStatus() === 'Queued';
        });
    }); // Queued Deploys table filter
    self.currentDeploys = ko.computed(function () {
        return ko.utils.arrayFilter(self.deploy(), function (rec) {
            return rec.depStatus() === 'Deploying' || rec.depStatus() === 'Completed' || rec.depStatus() === 'Failed';
        });
    }); // Current Deploys table filter
    self.commentsFiltered = ko.computed(function () {
        return ko.utils.arrayFilter(self.comment(), function (rec) {
            return rec.depID() == self.obsID();
        });
    }); // Filters the comments section based on record selected

    ///MODAL FUNCTIONS/////////////////////////////////////////////////
    self.openModal = function (deploy) {

        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var feature = document.getElementById("spFeature");
        var version = document.getElementById("spVersion");

        ctl.value = deploy.depStatus();
        objstatus = deploy.depStatus();
        console.log(objstatus);
        id.value = deploy.depID;
        feature.innerText = deploy.depFeature();
        version.innerText = deploy.depVersion();

        modal.style.display = "block";
        console.log('modal triggered');

        window.onclick = function (event) {
            if (event.target == modal) {
                $("#statusModal").fadeOut();
            }
        }
    } // Open Modal
    self.closeModal = function () {
        var error = document.getElementById("errorStatusModalChange");
        $("#statusModal").fadeOut();
        $("#commentBody").fadeOut();
        error.style.display = "none";

    } // Close Modal
    self.submitStatus = function () {
        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var errorMsg = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentField");

        //Checks if status has NOT been changed
        if (objstatus == ctl.value) {
            if (errorMsg.style.display == "none") {
                errorMsg.style.display = "block";
                errorMsg.textContent = "You must change the status field in order to submit. Please select a new status, or select Cancel.";
            }
            else {
                errorMsg.style.display = "none";
            }

            return;
        }
        //Checks if status was set to failed, but comment was NOT entered
        if (ctl.value == 'Failed' && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter a comment before you can submit the status as FAILED.";
            return;
        }

        ko.utils.arrayForEach(self.deploy(), function (mainItem) {

            if (id.value == mainItem.depID) {
                if (ctl.value == 'Completed') {
                    mainItem.depEndTime(dateNow());
                    console.log(mainItem.depEndTime());
                }
                else if (ctl.value == 'Failed') {
                    //Comment JSON string
                    var json = {};
                    //json["odata.type"] = "DeployTrackerMVC2.tblComment";
                    json["comBody"] = comment.value;
                    json["comDateTime"] = dateNow();
                    json["depID"] = id.value;
                    console.log(JSON.stringify(json));

                    $.ajax({
                        url: "/api/CommentAPI",
                        type: "POST",
                        async: true,
                        mimeType: "text/html",
                        data: JSON.stringify(json),
                        contentType: "application/json",
                        dataType: "json",
                        success: function (data) {
                            console.log(data);
                            console.log("Successfully posted comment");
                        },

                        error: function (msg) {
                            console.log("error: ", msg.status);
                            console.log(msg.statusText);
                            console.log(msg.responseText);
                            console.log("Ready state: ", msg.readyState);
                        }
                    });
                    mainItem.depEndTime(dateNow());
                    console.log(mainItem.depEndTime());

                }
                else if (ctl.value == 'Deploying') {
                    mainItem.depStartTime(dateNow());
                    console.log(mainItem.depStartTime());
                }
                mainItem.depStatus(ctl.value);

            }

        });
        $("#statusModal").fadeOut();
        errorMsg.style.display = "none";
        comment.style.display = "none";
        comment.value = "";
    } // Submit new status
    self.submitComment = function () {
        var commentField = document.getElementById("recordCommentField");
        if (commentField.value.trim() == "") {
            console.log("Empty comment field... can not continue.");
            return;
        }

        var json = {};
        json["comBody"] = commentField.value;
        json["comDateTime"] = dateNow();
        json["depID"] = self.obsID();
        console.log(JSON.stringify(json));

        $.ajax({
            url: "/api/CommentAPI",
            type: "POST",
            async: true,
            mimeType: "text/html",
            data: JSON.stringify(json),
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                console.log(data);
                console.log("Successfully posted comment");
            },

            error: function (msg) {
                console.log("error: ", msg.status);
                console.log(msg.statusText);
                console.log(msg.responseText);
                console.log("Ready state: ", msg.readyState);
            }
        });
        deploySignalR.server.updateAll();
        self.updateViewModelComment();
        cancelComment();
    } //Submit new comment (in RECORD DETAILS modal)
}

//SignalR Events
$(function () {

    var deploySignalR = $.connection.deploy;
    var viewModel = new DeployViewModel(deploySignalR);
    var findDeploy = function (id) {
        return ko.utils.arrayFirst(viewModel.deploy(), function (item) {
            if (item.depID == id) {
                return item;
            }
        });
    } // Helper function that iterates over each record within the ViewModel, and finds and returns the ID that matches

    //SIGNALR FUNCTIONS//////////////////////////////////////////////
    deploySignalR.client.updateAll = function () {

        console.log(viewModel.obsCheckEdit());

        //Warning toast triggered if client is engaged in editing a row
        if (viewModel.obsCheckEdit() >= 1) {
            var msg = "You are currently editing a record. Changes have been made to other records. Please refresh your browser when you are finished.";
            var cont = "Changes have been made...";
            infoToast(msg, cont);
        }
        else if (viewModel.obsCheckEdit() == 0) {
            viewModel.updateViewModel();
            viewModel.updateViewModelComment();
            notifyMe();
            console.log('Viewmodel updated');
        }
    } // Update all function, to be triggered when new batch of deploys are created
    deploySignalR.client.updateDeploy = function (id, key, value) {
        var deploy = findDeploy(id);
        deploy[key](value);

    } // updateDeploy function, to be triggered through SignalR
    deploySignalR.client.unlockDeploy = function (id) {
        var deploy = findDeploy(id);
        deploy.depLocked(false);
    } // unlockDeploy function, to be triggered when user selects "done"
    deploySignalR.client.lockDeploy = function (id) {
        var deploy = findDeploy(id);
        deploy.depLocked(true);

    } // lockDeploy function, to be triggered when a user selects "edit"

    //CONNECTION FUNCTIONS/////////////////////////////////////////
    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel, document.getElementById("BodyContent"));
        console.log("Connected to SignalR hub");

    }); // Connection (to SignalR hub) start function
    $.connection.hub.disconnected = function (deploy) {
        if (deploy != null) {

            //This calls the server-side 'Unlock' method that unlocks the row
            deploySignalR.server.unlock(deploy.depID);
        }
    } // Disconnecting from SignalR hub

});


/* Open when someone selects a record */
function openNav() {
   
    $("#DetailsView").modal("show");
}
//Updates the paginate function (work in progress)
function updateCurrentPaginate() {

    $('#CurrentDeploysTable').after('<div id="nav"></div>');
    var rowsShown = 4;
    var rowsTotal = $('#CurrentDeploysTable tbody tr').length;
    var numPages = rowsTotal / rowsShown;
    for (i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#nav').append('<a href="#" rel="' + i + '">' + pageNum + '</a> ');
    }
    $('#CurrentDeploysTable tbody tr').hide();
    $('#CurrentDeploysTable tbody tr').slice(0, rowsShown).show();
    $('#nav a:first').addClass('active');
    $('#nav a').bind('click', function () {

        $('#nav a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $('#CurrentDeploysTable tbody tr').css('opacity', '0.0').hide().slice(startItem, endItem).
            css('display', 'table-row').animate({ opacity: 1 }, 300);
    });
};
//Error toast
function errorToast(err) {
    toastr.error(err, 'Error:');
    console.log(err);
}
//Success toast
function successToast(msg) {
    toastr.success(msg, "Success!");

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "limit": "5",
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "9000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}
//Info toast
function infoToast(msg, cont) {
    toastr["info"](msg, cont);

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "limit": "5",
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "9000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}
//Browser notification
function notifyMe() {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification("Hi there!");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification("Hi there!");
            }
        });
    }

    // At last, if the user has denied notifications, and you 
    // want to be respectful there is no need to bother them any more.
}
//Returns today's date
function dateNow() {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset());
}
//Checks the value of a status field
function checkStatus() {
    var ctl = document.getElementById("ctlmodalStatus");
    var cmtBody = document.getElementById("commentBody");
    //console.log("Check status");
    if (ctl.value == "Failed") {
        $("#commentBody").fadeIn('slow');
        console.log("Set to fail");
    }
    else {
        $("#commentBody").fadeOut();
    }
}

function checkSelID() {
    console.log(selID);
}
//Shows comment field and buttons in record details modal
function newComment() {
    
    $("#comment-button-div-1").fadeOut("fast");
    $("#comment-button-div-2").fadeIn("fast");
    $("#record-comment-text-field").fadeIn("fast");
}
//Hides comment field and buttons in record details modal
function cancelComment() {
    
    $("#comment-button-div-1").fadeIn("fast");
    $("#comment-button-div-2").fadeOut("fast");
    $("#recordCommentField").val("");
    $("#record-comment-text-field").fadeOut("fast");
    
}
//NOTE: The save comment function is located inside the viewmodel as submitComment

//Fires when record details modal is closed
$("#DetailsView").on("hidden.bs.modal", function () {
    cancelComment();
});

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}