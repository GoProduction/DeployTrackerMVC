//Global variables
var smokeState;
var smokeWindow = document.getElementById("smokeWindow");
var smokeButton = document.getElementById("smokeToggleButton");
var objstatus = '';
var selID = '';

//Cache Variables
////Current Deploys
//////Type
var ctStore = localStorage['curTypeCached'];
if (ctStore) var curTypeCached = JSON.parse(ctStore);
else curTypeCached = { val: 'All' };
console.log("curTypeCached is");
console.log(curTypeCached);
//////Time
var ctmStore = localStorage['curTimeCached'];
if (ctmStore) var curTimeCached = JSON.parse(ctmStore);
else curTimeCached = { val: '24' };
console.log("curTimeCached is");
console.log(curTimeCached);

////Smoke Deploys
//////Type
var stStore = localStorage['smokeTypeCached'];
if (stStore) var smokeTypeCached = JSON.parse(stStore);
else smokeTypeCached = { val: 'All' };
console.log("smokeTypeCached is ");
console.log(smokeTypeCached);
//////Time
var stmStore = localStorage['smokeTimeCached'];
if (stmStore) var smokeTimeCached = JSON.parse(stmStore);
else smokeTimeCached = { val: '24' };
console.log('smokeTimeCached is ');
console.log(smokeTimeCached);

//Knockout find function (used for filter)
ko.observableArray.fn.find = function (prop, data) {
    var valueToMatch = data[prop];
    return ko.utils.arrayFirst(this(), function (item) {
        return item[prop] === valueToMatch;
    });
};

var DeployViewModel = function (deploySignalR, curTypeCached, curTimeCached, smokeTypeCached, smokeTimeCached) {
    var self = this;
   
    //FILTER OBSERVABLES FOR TABLES
    self.typeArray = ko.observableArray([
        { text: 'All Current Deploys', val: 'All' },
        { text: 'Deploying', val: 'Deploying' },
        { text: 'Completed', val: 'Completed' },
        { text: 'Failed', val: 'Failed' }
    ]) //Used for type filter
    self.timeArray = ko.observableArray([
        { text: 'Past 24 hours', val: '24' },
        { text: 'Past 7 days', val: '168' },
        { text: 'Past month', val: '730' }
    ]); //Used for time filter
    self.smokeArray = ko.observableArray([
        { text: 'All smoke statuses', val: 'All' },
        { text: 'Ready', val: 'Ready' },
        { text: 'Pass', val: 'Pass' },
        { text: 'Conditional', val: 'Conditional' },
        { text: 'Fail', val: 'Fail' }
    ]);
    self.currentSelectedType = ko.observable(self.typeArray.find("val", curTypeCached));
    self.currentSelectedTime = ko.observable(self.timeArray.find("val", curTimeCached));
    self.smokeSelectedType = ko.observable(self.smokeArray.find("val", smokeTypeCached));
    self.smokeSelectedTime = ko.observable(self.timeArray.find("val", smokeTimeCached));
    self.checkVMCurrent = function () {
        console.log(self.currentSelectedType);
        console.log(self.currentSelectedTime);
    }

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
    self.smoke = ko.observableArray([
        { tmpSmoke: "Ready" },
        { tmpSmoke: "Pass" },
        { tmpSmoke: "Conditional" },
        { tmpSmoke: "Fail" }
    ]);
    self.comment = ko.observableArray(); // Comment observable array
    self.selected = ko.observableArray(self.deploy()[0]); //Determines if record is selected

    //ObSERVABLES///////////////////////////////////////////////////////////
    self.obsCheckEdit = ko.observable(0); // Observable that is used to check if any field is being edited
    self.loading = ko.observable(true); // Loading function that triggers the loading animation
    self.obsID = ko.observable(''); // Observable that is used to filter any results by ID
    self.searchTime = ko.observable(''); //Used for filtering table data

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
        checkModalStatus(data.depStatus(), data.depSmoke());

    }; // Run when record is selected, and open the record modal
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
                        depSmoke: ko.observable(deploy.depSmoke),
                        depTimeDiff: ko.observable(deploy.depTimeDiff),
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
                depSmoke: ko.observable(deploy.depSmoke),
                //formattedDate: ko.observable(moment(new Date(deploy.depStartTime)).format('MMMM Do')),
                depTimeDiff: ko.observable(deploy.depTimeDiff),
                Edit: ko.observable(false),
                depLocked: ko.observable(deploy.depLocked)

            }

            self.watchModel(obsDeploy, self.modelChanged);
            //console.log(obsDeploy);
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

            var date = rec.depStartTime();
            var val = dateTimeDifference(date);

            if (val <= self.currentSelectedTime().val) {
                if (self.currentSelectedType().val != 'All') {
                    return (rec.depStatus() === self.currentSelectedType().val)
                }
                else {
                    return (rec.depStatus() === 'Deploying' || rec.depStatus() === 'Completed' || rec.depStatus() === 'Failed')
                }
                
            };

        });
    }); // Current Deploys table filter
    self.smokeDeploys = ko.computed(function () {
        return ko.utils.arrayFilter(self.deploy(), function (rec) {

            var date = rec.depStartTime();
            var val = dateTimeDifference(date);
            if (val <= self.smokeSelectedTime().val) {
                if (self.smokeSelectedType().val != 'All') {
                    return (rec.depSmoke() === self.smokeSelectedType().val)
                }
                else {
                    return rec.depSmoke() === 'Ready' || rec.depSmoke() === 'Fail' || rec.depSmoke() === 'Pass' || rec.depSmoke() === 'Conditional';
                }
            }

        });
    }); // Current Deploys table filter
    self.commentsFiltered = ko.computed(function () {
        return ko.utils.arrayFilter(self.comment(), function (rec) {
            return rec.depID() == self.obsID();
        });
    }); // Filters the comments section based on record selected

    ///MODAL FUNCTIONS/////////////////////////////////////////////////
    self.openStatusModal = function (deploy) {

        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var feature = document.getElementById("spFeature");
        var version = document.getElementById("spVersion");
        var error = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentBody");

        ctl.value = deploy.depSmoke();
        objstatus = deploy.depSmoke();
        console.log(objstatus);
        id.value = deploy.depID;
        feature.innerText = deploy.depFeature();
        version.innerText = deploy.depVersion();

        modal.style.display = "block";
        toggleElementVisibility(error, comment);
        console.log('modal triggered');

        window.onclick = function (event) {
            if (event.target == modal) {
                $("#statusModal").fadeOut();
            }
        }
    } // Open Modal
    self.closeModal = function () {
        var error = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentBody");
        $("#statusModal").fadeOut();
        toggleElementVisibility(error, comment);

    } // Close Modal
    self.submitStatus = function (deploy) {
        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var errorMsg = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentField");
        var feature = document.getElementById("spFeature").innerText;
        var icon = '';

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
        if (ctl.value == 'Fail' && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter the issues that caused the smoke to fail.";
            return;
        }
        else if (ctl.value == 'Conditional' && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter the issues that caused the smoke to conditionally pass.";
            return;
        }

        ko.utils.arrayForEach(self.deploy(), function (mainItem) {

            if (id.value == mainItem.depID) {

                if (ctl.value == 'Fail' || ctl.value == 'Conditional') {
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

                }

                mainItem.depSmoke(ctl.value);

            }

        });
        //Notification
        //Icons
        var pass = '/images/static_pass.jpg';
        var fail = '/images/static_fail.jpg';
        var conditional = '/images/static_conditional';
        var ready = '/images/static_loading.jpg';
        //Icon assignment
        if (ctl.value == 'Pass') {
            icon = pass;
        }
        else if (ctl.value == 'Conditional') {
            icon = conditional;
        }
        else if (ctl.value == 'Fail') {
            icon = fail;
        }
        else {
            icon = ready;
        }

        var message = "User has updated " + feature + " to " + ctl.value;

        deploySignalR.server.notification("Smoke", message, icon);

        $("#statusModal").fadeOut();
        errorMsg.style.display = "none";
        comment.style.display = "none";
        comment.value = "";
        //deploySignalR.server.updateAll();

        
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

    //ANIMATIONS//////////////////////////////////////////////////////
    self.showRow = function (elem) {
        if (elem.nodeType === 1) $(elem).hide().slideDown()
    };
    self.hideRow = function (elem) {
        if (elem.nodeType === 1) $(elem).slideUp(function () {
            $(elem).remove();
        });
    };

    //SORTING FUNCTIONS//////////////////////////////////////////////
    self.testSortByDate = function (...deploy) {
        if (deploy != null) {
            var value = deploy.sort(function (l, r) {
                return (l.depEndTime() == r.depEndTime()) ? (l.depEndTime() < r.depEndTime() ? 1 : -1) : (l.depStartTime() < r.depStartTime() ? 1 : -1)
            });
            return value;
        }
    };
    self.sortByDate = function (l, r) {
        
            return ((l.depEndTime() == r.depEndTime()) ? (l.depEndTime() < r.depEndTime() ? 1 : -1) : (l.depStartTime() < r.depStartTime() ? 1 : -1)) 
    }

    //CACHING FUNCTIONS/////////////////////////////////////////////
    self.cacheCurrentType = function () {
        var ctl = document.getElementById("ctlCurrentType");
        var sel = ctl.options[ctl.selectedIndex];
        if (ctl.selectedIndex == 0) {
            curTypeCached = { val: "All" };
            localStorage['curTypeCached'] = JSON.stringify(curTypeCached);
            
        }
        else {
            curTypeCached = { val: sel.text };
            localStorage['curTypeCached'] = JSON.stringify(curTypeCached);
            
        }

        console.log("Cached as ");
        console.log(curTypeCached);
    }
    self.cacheCurrentTime = function () {
        var ctl = document.getElementById("ctlCurrentTime");
        if (ctl.selectedIndex == 0) {
            curTimeCached = { val: '24' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
        else if (ctl.selectedIndex == 1) {
            curTimeCached = { val: '168' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
        else if (ctl.selectedIndex == 2) {
            curTimeCached = { val: '730' };
            localStorage['curTimeCached'] = JSON.stringify(curTimeCached);
        }
    }
    self.cacheSmokeType = function () {
        var ctl = document.getElementById("ctlSmokeType");
        var sel = ctl.options[ctl.selectedIndex];
        if (ctl.selectedIndex == 0) {
            smokeTypeCached = { val: "All" };
            localStorage['smokeTypeCached'] = JSON.stringify(smokeTypeCached);

        }
        else {
            smokeTypeCached = { val: sel.text };
            localStorage['smokeTypeCached'] = JSON.stringify(smokeTypeCached);
            
        }

        console.log("Cached as ");
        console.log(smokeTypeCached);
    }
    self.cacheSmokeTime = function () {
        var ctl = document.getElementById("ctlSmokeTime");
        if (ctl.selectedIndex == 0) {
            smokeTimeCached = { val: '24' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
        else if (ctl.selectedIndex == 1) {
            smokeTimeCached = { val: '168' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
        else if (ctl.selectedIndex == 2) {
            smokeTimeCached = { val: '730' };
            localStorage['smokeTimeCached'] = JSON.stringify(smokeTimeCached);
        }
    }
    self.loadCurrentType = function (option, item) {

        ko.applyBindingsToNode(option.parentElement, self.currentSelectedType, item);
        console.log("CurrentOption is loaded as: ");
        console.log(self.CurrentOption);
    }
   

}; //Main viewmodel


//SignalR Events
$(function () {
    
    var deploySignalR = $.connection.deploy;
    var viewModel = new DeployViewModel(deploySignalR, curTypeCached, curTimeCached, smokeTypeCached, smokeTimeCached);
    ko.applyBindings(viewModel);
    
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

            browserNotification();
            console.log('Viewmodel updated');
        }
    } // Update all function, to be triggered when new batch of deploys are created
    deploySignalR.client.updateDeploy = function (id, key, value) {
        var deploy = findDeploy(id);
        console.log("Deploy updated");
        deploy[key](value);


    } // updateDeploy function, to be triggered through SignalR
    deploySignalR.client.updateComments = function () {
        viewModel.updateViewModelComment();
        console.log("New comment submitted...");
    }
    deploySignalR.client.unlockDeploy = function (id) {
        var deploy = findDeploy(id);
        deploy.depLocked(false);
    } // unlockDeploy function, to be triggered when user selects "done"
    deploySignalR.client.lockDeploy = function (id) {
        var deploy = findDeploy(id);
        deploy.depLocked(true);

    } // lockDeploy function, to be triggered when a user selects "edit"
    deploySignalR.client.browserNotification = function (type, message, icon) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notification");
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var options = {
                body: message,
                icon: icon,
                color: "#000000"
            };
            var notification = new Notification(type, options);
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

    //CONNECTION FUNCTIONS/////////////////////////////////////////
    $.connection.hub.start().done(function () {
        
        console.log("Connected to SignalR hub");
        $(".loading-class").fadeOut("slow");
        if (smokeWindow.style.display == 'block') {
            smokeState = 1;
        }
        else {
            smokeState = 0;
        }
        console.log("Smoke window visibility: " + smokeState);

    }); // Connection (to SignalR hub) start function
    $.connection.hub.disconnected = function (deploy) {
        if (deploy != null) {

            //This calls the server-side 'Unlock' method that unlocks the row
            deploySignalR.server.unlock(deploy.depID);
        }
    } // Disconnecting from SignalR hub

});

$(document).ready(function () {
   
});
/* Open when someone selects a record */
function openNav() {

    $("#DetailsView").modal("show");
}
//Checks the status and adjusts the header color
function checkModalStatus (status, smoke) {
    var mainHeader = document.getElementById("recordModalHeader");
    var smokeHeader = document.getElementById("smokeHeader");
    //Status logic
    if (status === 'Deploying') {
        mainHeader.style.backgroundColor = "rgba(255, 255, 0, .5)";
    }
    else if (status === 'Completed') {
        mainHeader.style.backgroundColor = "rgba(0, 255, 33, .5)";
    }
    else if (status === 'Failed') {
        mainHeader.style.backgroundColor = "rgba(255, 0, 0, .5)";
    }
    else if (status === 'Queued') {
        mainHeader.style.backgroundColor = "white";
    }

    //Smoke logic
    if (smoke === "Pass") {
        smokeHeader.style.backgroundColor = "rgba(0, 255, 33, .5)";
    }
    else if (smoke === "Conditional") {
        smokeHeader.style.backgroundColor = "rgba(255, 255, 0, .5)";
    }
    else if (smoke === "Fail") {
        smokeHeader.style.backgroundColor = "rgba(255, 0, 0, .5)"
    }
    else {
        smokeHeader.style.backgroundColor = "white";
    }
}
//Checks visibility of modal elements and makes them not visible
function toggleElementVisibility(elm1, elm2) {
    elm1.style.display = "none";
    elm2.style.display = "none";
}
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
    if (ctl.value == "Fail" || ctl.value == "Conditional") {
        $("#commentBody").fadeIn('slow');
        console.log("Set to fail");
    }
    else if (ctl.value == "Completed") {
        $("#smoke-div").fadeIn();
        $("#commentBody").fadeOut();
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


//Hides/shows the Smoke Queue div
function toggleSmokeWindow() {

    if (smokeWindow.style.display === "none") {
        $("#smokeWindow").fadeIn("fast");
        smokeState = 1;
        toggleSmokeButton();
        console.log(smokeState);
    }
    else {
        $("#smokeWindow").fadeOut("fast");
        smokeState = 0;
        toggleSmokeButton();
        console.log(smokeState);
    }
}
//Toggles the smoke window button
function toggleSmokeButton() {
    if (smokeState == 0) {
        smokeButton.className = "fa fa-angle-left";
    }
    else {
        smokeButton.className = "fa fa-angle-right";
    }
}

//Fires when record details modal is closed
$("#DetailsView").on("hidden.bs.modal", function () {
    cancelComment();
});

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

//Calculates the difference in hours between two dates
function dateTimeDifference(date) {
    var now = new Date();
    var then = new Date(date);
    var hours = Math.abs(now.valueOf() - then.valueOf()) / 3600000
    return hours;
}

