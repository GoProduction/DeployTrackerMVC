﻿//Knockout find function (used for filter)
ko.observableArray.fn.find = function (prop, data) {
    var valueToMatch = data[prop];
    return ko.utils.arrayFirst(this(), function (item) {
        return item[prop] === valueToMatch;
    });
};

var DeployViewModel = function (deploySignalR, curTypeCached, curTimeCached, smokeTypeCached, smokeTimeCached) {
    var self = this;

    //Loading variable: max variable is currently 6
    var loadingVar = 0;

    //Css class evaluation for table rows
    self.rowColor = function (deploy) {
        if (deploy.statusID() == 2) {
            return 'css-deploying';
        }
        else if (deploy.statusID() == 4) {
            return 'css-deploy-failed';
        }
        else if (deploy.smokeID() == 3) {
            return 'css-smoke-pass';
        }
        else if (deploy.smokeID() == 4) {
            return 'css-smoke-conditional';
        }
        else if (deploy.smokeID() == 5) {
            return 'css-smoke-failed';
        }
        else if (deploy.statusID() == 3 && deploy.smokeID() == 1) {
            return 'css-deploy-failed';
        }
        else {
            return null;
        }
    };

    //Finder functions
    self.featureFromID = function (id) {
        return ko.utils.arrayFirst(self.feature(), function (item) {
            if (item.feaID == id) {
                //console.log("feaName: ", ko.unwrap(item.feaName));
                return ko.unwrap(item.feaName);
            }
        })
    };
    self.environmentFromID = function (id) {
        return ko.utils.arrayFirst(self.environment(), function (item) {
            if (item.envID == id) {
                //console.log("envName: ", ko.unwrap(item.envName));
                return ko.unwrap(item.envName);
            }
        })
    };
    self.noteFromID = function (id) {
        return ko.utils.arrayFirst(self.notes(), function (item) {
            if (item.noteID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.noteVisID);
            }
        })
    };
    self.smokeFromID = function (id) {
        return ko.utils.arrayFirst(self.smoke(), function (item) {
            if (item.smokeID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.smokeName);
            }
        })
    };
    self.statusFromID = function (id) {
        return ko.utils.arrayFirst(self.status(), function (item) {
            if (item.statusID == id) {
                //console.log("envName: ", ko.unwrap(item.noteVisID));
                return ko.unwrap(item.statusName);
            }
        })
    };

    //FILTER OBSERVABLES FOR TABLES
    self.typeArray = ko.observableArray([
        { text: 'All Current Deploys', val: 'All' },
        { text: 'Deploying', val: 2 },
        { text: 'Completed', val: 3 },
        { text: 'Failed', val: 4 }
    ]) //Used for type filter
    self.timeArray = ko.observableArray([
        { text: 'Past 24 hours', val: '24' },
        { text: 'Past 7 days', val: '168' },
        { text: 'Past month', val: '730' }
    ]); //Used for time filter

    self.currentSelectedType = ko.observable(self.typeArray.find("val", curTypeCached));
    self.currentSelectedTime = ko.observable(self.timeArray.find("val", curTimeCached));
    self.checkVMCurrent = function () {
        console.log(self.currentSelectedType);
        console.log(self.currentSelectedTime);
    }

    //OBSERVABLE ARRAYS////////////////////////////////////////////////////////
    self.deploy = ko.observableArray(); // Deploy observable array that will be called through HTML
    self.feature = ko.observableArray(); // Feature observable array that will be used to populate feature drop-down
    self.environment = ko.observableArray(); // Environment observable array that will be used to populate environment drop-down
    self.status = ko.observableArray(); // Status observable array
    self.smoke = ko.observableArray(); //Smoke observable array
    self.comment = ko.observableArray(); // Comment observable array
    self.selected = ko.observableArray(self.deploy()[0]); //Determines if record is selected

    //ObSERVABLES///////////////////////////////////////////////////////////
    self.obsCheckEdit = ko.observable(0); // Observable that is used to check if any field is being edited
    self.loading = ko.observable(true); // Loading function that triggers the loading animation
    self.obsID = ko.observable(''); // Observable that is used to filter any results by ID
    self.searchTime = ko.observable(''); //Used for filtering table data
    self.selectedFeature = ko.observable(null);
    self.selectedEnvironment = ko.observable(null);
    self.selectedStatus = ko.observable(null);
    self.selectedSmoke = ko.observable(null);

    //FUNCTIONS///////////////////////////////////////////////////////////
    self.dateAndUser = function (date, user) {
        return moment(date, 'MMM DD YYYY') + " " + user;
    }
    self.selectRecord = function (data) {
        //Assign variables
        self.selected(data);
        self.selectedFeature(data.feaID());
        self.selectedEnvironment(data.envID());
        self.selectedStatus(data.statusID());
        self.selectedSmoke(data.smokeID());

        selID = self.selected().depID;
        self.obsID(selID);
        console.log("obsID: ");
        console.log(self.obsID);
        console.log("selID: ");
        console.log(selID);
        openNav();
        var statusHeader = document.getElementById("statusHeader");
        var smokeHeader = document.getElementById("smokeHeader");
        checkModalStatus(data.statusID(), data.smokeID(), statusHeader, smokeHeader)

    }; // Run when record is selected, and open the record modal
    self.updateViewModel = function (payload) {
        var jvsObject = JSON.parse(payload);
        var newDeploy = new incomingDeploy(
            jvsObject.depID,
            jvsObject.feaID,
            jvsObject.depVersion,
            jvsObject.envID,
            jvsObject.depPlannedDateTime,
            jvsObject.depStartTime,
            jvsObject.depEndTime,
            jvsObject.statusID,
            jvsObject.smokeID);
        console.log("New JS object", jvsObject);
        self.deploy.push(newDeploy);
        self.watchModel(newDeploy, self.modelChanged);

    } // Updates the viewmodel when new DEPLOYS have been submitted
    self.updateViewModelComment = function (payload) {
        var jvsObject = JSON.parse(payload);
        var newComment = new Comment(
            jvsObject.comID,
            jvsObject.comBody,
            jvsObject.comDateTime,
            jvsObject.comUser,
            jvsObject.depID
        );
        console.log("New comment: ", jvsObject);
        self.comment.push(newComment);
    } // Updates the viewmodel when new COMMENT has been submitted
    self.removeDeploy = function (deploy) {
        self.deploy.remove(deploy);
    }
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
        var payload = {};
        payload[key] = val;
        console.log("self.modelChanged()", payload);
    }

    //GET REQUESTS///////////////////////////////////////////////////////
    $.getJSON('/odata/Deploys', function (data) {
        self.deploy(ko.utils.arrayMap(data.value, function (deploy) {
            var obsDeploy = {
                depID: deploy.depID,
                feaID: ko.observable(deploy.feaID),
                depVersion: ko.observable(deploy.depVersion),
                envID: ko.observable(deploy.envID),
                depPlannedDateTime: ko.observable(deploy.depPlannedDateTime),
                depStartTime: ko.observable(deploy.depStartTime),
                depEndTime: ko.observable(deploy.depEndTime),
                statusID: ko.observable(deploy.statusID),
                smokeID: ko.observable(deploy.smokeID)
            }

            return obsDeploy;

        }));
        loadingVar++;
        console.log("Loading var: ", loadingVar, " loaded Deploys");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Fetches data from Deploys table
    $.getJSON('/odata/Features', function (data) {
        self.feature(ko.utils.arrayMap(data.value, function (feature) {
            var obsFeature = {
                feaID: feature.feaID,
                feaName: ko.observable(feature.feaName)
            }

            return obsFeature;
        }));
        loadingVar++;
        console.log("Loading var: ", loadingVar, " loaded Features");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }

    }); // Fetches data from Features table
    $.getJSON('/odata/Environments', function (data) {
        self.environment(ko.utils.arrayMap(data.value, function (environment) {
            var obsEnvironment = {
                envID: environment.envID,
                envName: ko.observable(environment.envName)
            }

            return obsEnvironment;
        }));
        loadingVar++;
        console.log("Loading var: ", loadingVar, " loaded Environments");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Environments table
    $.getJSON('/odata/Status', function (data) {
        self.status(ko.utils.arrayMap(data.value, function (status) {
            var obsStatus = {
                statusID: status.statusID,
                statusName: ko.observable(status.statusName)
            };

            return obsStatus;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Status");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Status table
    $.getJSON('/odata/Smokes', function (data) {
        self.smoke(ko.utils.arrayMap(data.value, function (smoke) {
            var obsSmoke = {
                smokeID: smoke.smokeID,
                smokeName: ko.observable(smoke.smokeName)
            };

            return obsSmoke;
        }));
        loadingVar++;
        console.log("loading var: ", loadingVar, " loaded Smoke");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Status table
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
        loadingVar++;
        console.log("Loading var: ", loadingVar, " loaded Comments");
        if (loadingVar == 6) {
            $(".loading-class").fadeOut("slow");
        }
        else {
            return;
        }
    }); // Featches data from Comments table

    ///TABLE FILTERS////////////////////////////////////////////////////
    self.queuedDeploys = ko.computed(function () {
        var filteredValue = 1;
        var filtered = filteredValue ? ko.utils.arrayFilter(self.deploy(), function (rec) {
            return rec.statusID() === 1;
        }) : self.deploy();

        return filtered.sort(function (l, r) {
            console.log("Sorted queued deploys");
            return (l.depPlannedDateTime() > r.depPlannedDateTime() ? 1 : -1)
        });
    });// Queued Deploys table filter
    self.currentDeploys = ko.computed(function () {
        return ko.utils.arrayFilter(self.deploy(), function (rec) {

            var date = rec.depStartTime();
            var val = dateTimeDifference(date);

            if (val <= self.currentSelectedTime().val) {
                if (self.currentSelectedType().val != 'All') {
                    return (rec.statusID() === self.currentSelectedType().val)
                }
                else {
                    return (rec.statusID() === 2 || rec.statusID() === 3 || rec.statusID() === 4)
                }
                
            };

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
        

        self.selected(deploy);
        self.selectedFeature(deploy.feaID());
        modal.style.display = "block";
        $("#commentBody").fadeOut();
        console.log('Status modal triggered');
        console.log('Record: ', self.selected);

        ctl.value = deploy.smokeID();
        objstatus = deploy.smokeID();
        console.log(objstatus);
        id.value = deploy.depID;
        
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
    self.submitStatus = function () {
        //Selected deploy values
        var selFeature = ko.utils.unwrapObservable(self.selected().feaID);
        var selVersion = ko.utils.unwrapObservable(self.selected().depVersion);
        var selEnv = ko.utils.unwrapObservable(self.selected().envID);
        console.log("Selected values: ", selFeature, selVersion, selEnv);

        //HTML elements
        var modal = document.getElementById("statusModal");
        var ctl = document.getElementById("ctlmodalStatus");
        var id = document.getElementById("ctlmodalID");
        var errorMsg = document.getElementById("errorStatusModalChange");
        var comment = document.getElementById("commentField");
        var commentBody = document.getElementById("commentBody");
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
        if (ctl.value == 5 && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter the issues that caused the smoke to fail.";
            return;
        }
        else if (ctl.value == 4 && comment.value.trim() == "") {
            errorMsg.style.display = "block";
            errorMsg.textContent = "You must enter the issues that caused the smoke to conditionally pass.";
            return;
        }

        ko.utils.arrayForEach(self.deploy(), function (mainItem) {

            if (id.value == mainItem.depID) {

                if (ctl.value == 5 || ctl.value == 4) {
                    //Comment JSON string
                    var payload = {};
                    //json["odata.type"] = "DeployTrackerMVC2.tblComment";
                    payload["comBody"] = comment.value;
                    payload["comDateTime"] = dateNow();
                    payload["depID"] = id.value;
                    console.log(JSON.stringify(payload));
                    postComment(deploySignalR, payload);
                    
                }
                mainItem.smokeID(ctl.value);
                //Prep variables for PATCH
                var payload = {};
                payload["smokeID"] = ko.utils.unwrapObservable(mainItem.smokeID);
                patchDeploy(payload, mainItem);
            }

        });

        //Evaluate status and assign icon
        var icon = assignIcon(ctl.value);
        //Build message
        var message = assignMessage(selFeature, selVersion, selEnv, ctl.value);
        //Send notification to server
        deploySignalR.server.notification("Smoke", message, icon);
        $("#statusModal").fadeOut();
        errorMsg.style.display = "none";
        $("#commentBody").fadeOut();
        comment.value = "";
        //deploySignalR.server.updateAll();

        
    } // Submit new status
    self.submitComment = function () {
        var commentField = document.getElementById("recordCommentField");
        if (commentField.value.trim() == "") {
            console.log("Empty comment field... can not continue.");
            return;
        }
        //Prepare value for POSTing comment
        var payload = {};
        payload["comBody"] = commentField.value;
        payload["comDateTime"] = dateNow();
        payload["depID"] = self.selected().depID;
        //POST comment
        postComment(deploySignalR, payload);
        //Disable the comment field
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
    
    
    var findDeploy = function (id) {
        return ko.utils.arrayFirst(viewModel.deploy(), function (item) {
            if (item.depID == id) {
                return item;
            }
        });
    } // Helper function that iterates over each record within the ViewModel, and finds and returns the ID that matches

    //SIGNALR FUNCTIONS//////////////////////////////////////////////
    deploySignalR.client.updateAll = function (payload) {

        console.log(viewModel.obsCheckEdit());

        //Warning toast triggered if client is engaged in editing a row
        if (viewModel.obsCheckEdit() >= 1) {
            var msg = "You are currently editing a record. Changes have been made to other records. Please refresh your browser when you are finished.";
            var cont = "Changes have been made...";
            infoToast(msg, cont);
        }
        else if (viewModel.obsCheckEdit() == 0) {
            viewModel.updateViewModel(payload);
            console.log('Viewmodel updated');
        }
    } // Update all function, to be triggered when new batch of deploys are created
    deploySignalR.client.updateDeploy = function (id, key, value) {
        var deploy = findDeploy(id);
        console.log("Deploy updated");
        deploy[key](value);


    } // updateDeploy function, to be triggered through SignalR
    deploySignalR.client.updateComments = function (payload) {
        viewModel.updateViewModelComment(payload);
    }
    deploySignalR.client.removeDeploy = function (id) {
        var record = findDeploy(id);
        viewModel.removeDeploy(record);
    }
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

    }

    //CONNECTION FUNCTIONS/////////////////////////////////////////
    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel, document.getElementById('BodyContent'));
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
//Checks the status and adjusts the header color
function checkModalStatus (status, smoke, statusHeader, smokeHeader) {
    
    //Status logic
    if (status === 'Deploying') {
        statusHeader.style.backgroundColor = "rgba(255, 255, 0, .5)";
    }
    else if (status === 'Completed') {
        statusHeader.style.backgroundColor = "rgba(0, 255, 33, .5)";
    }
    else if (status === 'Failed') {
        statusHeader.style.backgroundColor = "rgba(255, 0, 0, .5)";
    }
    else if (status === 'Queued') {
        statusHeader.style.backgroundColor = "white";
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
    if (elm1.style.display != "none") {
        elm1.style.display = "none";
    }
    if (elm2.style.display != "none") {
        elm2.style.display = "none";
    }
    
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
    //If value is set to FAIL or CONDITIONAL
    if (ctl.value == 5 || ctl.value == 4) {
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

