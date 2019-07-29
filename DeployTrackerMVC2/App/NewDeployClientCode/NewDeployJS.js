//Form field references
var feature = document.getElementById("txtFeature");
var version = document.getElementById("txtVersion");
var environment = document.getElementById("txtEnvironment");
var plannedDate = document.getElementById("txtPlannedDate");
var plannedTime = document.getElementById("txtPlannedTime");

//Deploy template
var Deploy = function (depFeature, depVersion, depEnvironment, depPlannedDate, depPlannedTime, depStatus, depSmoke, Edit) {
    this.depFeature = ko.observable(depFeature);
    this.depVersion = ko.observable(depVersion);
    this.depPlannedDate = ko.observable(depPlannedDate);
    this.depPlannedTime = ko.observable(depPlannedTime);
    this.depStatus = ko.observable(depStatus);
    this.depSmoke = ko.observable(depSmoke);
    this.depEnvironment = ko.observable(depEnvironment);
    this.Edit = ko.observable(Edit);
};


var TempDeployViewModel = function (signalR) {

    var self = this;

    //Deploys array
    self.deploys = ko.observableArray();
    self.featureList = ko.observableArray();
    self.environmentList = ko.observableArray();
    self.tempTime = ko.observable(new Date());
    console.log(self.tempTime);

    //Function to determine the display mode of the table
    self.displayMode = function (deploys) {
        if (deploys.Edit()) {
            return 'edit-template';
        }
        else if (deploys.Edit(false)) {
            return 'read-template';
        }

    };

    //Add new record to temp table function
    self.add = function () {

        var datetime = new Date(document.getElementById("timeVal").innerText);

        var newRecord = [{

            depFeature: document.getElementById("txtFeature").value,
            depVersion: document.getElementById("txtVersion").value,
            depPlannedDate: document.getElementById("txtPlannedDate").value,
            depPlannedTime: datetime,
            depStatus: 'Queued',
            depSmoke: "Not Ready",
            depEnvironment: document.getElementById("txtEnvironment").value,
            Edit: false

        }];


        if (feature.value.length == 0 || version.value.length == 0 || environment.value.length == 0 || plannedDate.value.length == 0 || plannedTime.value.length == 0) {
            alert('You must enter ALL fields');

        }
        else {
            var newDeploy = ko.utils.arrayMap(newRecord, function (data) {
                return new Deploy(data.depFeature, data.depVersion, data.depEnvironment, data.depPlannedDate, data.depPlannedTime, data.depStatus, data.depSmoke, data.Edit)
            });

            //Push the new record to the temp table
            self.deploys.push.apply(self.deploys, newDeploy);
            //Reset the fields
            document.getElementById("FieldsForm").reset();

            console.log(ko.toJSON(self.deploys));

        }

    };

    self.submit = function () {

        try {
            var jsonString = ko.mapping.toJSON(self.deploys);
            var obj = JSON.parse(jsonString);

            if (jsonString == null) {
                errorToast("You must enter at least one entry");
                return;
            }

            for (var item in obj) {
                if (obj.hasOwnProperty(item)) {
                    //aJax POST request
                    $.ajax({
                        url: "/api/DeployAPI",
                        type: "POST",
                        async: true,
                        mimeType: "text/html",
                        data: JSON.stringify(obj[item]),
                        contentType: "application/json",
                        dataType: "json",
                        success: function (data) {
                            console.log(data);
                        },

                        error: function (msg) {
                            console.log("error: ", msg.status);
                        }
                    });
                }
            }
            var overlay = document.getElementById("submitOverlay");
            overlay.style.width = "100%";
            //Call the signalR hub to update all clients
            signalR.server.updateAll();
            successToast("Deploys have been successfully submitted.");
            setTimeout(redirect, 3000);

        }
        catch (err) {
            errorToast(err);
        }


    };

    self.edit = function (deploys) {
        deploys.Edit(true);
    };

    self.done = function (deploys) {
        deploys.Edit(false);
        console.log('done');
    }

    //Checks to make sure properties are observable
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key]) && key != 'Edit') {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                });
            }
        }
    }

    //Subscribes to observable objects, and listens for changes
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            callback(key, val);
        });
    }

    //Fetching data from tblFeature
    $.getJSON('/odata/Features', function (data) {
        self.featureList(ko.utils.arrayMap(data.value, function (featureList) {
            var obsFeature = {
                feaID: featureList.feaID,
                feaName: ko.observable(featureList.feaName)
            }

            return obsFeature;
        }));
    });

    //Fetching data from tblEnvironment
    $.getJSON('/odata/Environments', function (data) {
        self.environmentList(ko.utils.arrayMap(data.value, function (environmentList) {
            var obsEnvironment = {
                envID: environmentList.envID,
                envName: ko.observable(environmentList.envName)
            }

            return obsEnvironment;
        }));
    });
}


$(function () {

    var signalR = $.connection.deploy;
    var viewModel = new TempDeployViewModel(signalR);


    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel);
        console.log('Connected to signalR hub...')
    });



});


var DeleteKey = function (array, key) {
    this.array = array;
    this.key = key;
    var newarray = delete array.key;

    return newarray;

}

function errorToast(err) {
    toastr.error(err, 'Error:');
}

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

function redirect() {
    var url = $("#Redirect").val();
    location.href = url;
}
