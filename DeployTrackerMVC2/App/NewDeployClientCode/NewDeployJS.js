//Form field references
var feature = document.getElementById("txtFeature");
var version = document.getElementById("txtVersion");
var environment = document.getElementById("txtEnvironment");
var plannedDate = document.getElementById("txtPlannedDate");
var plannedTime = document.getElementById("txtPlannedTime");

//Deploy template
var Deploy = function (depFeature, depVersion, depEnvironment, depPlannedDateTime, depStatus, depSmoke, Edit) {
    this.depFeature = ko.observable(depFeature);
    this.depVersion = ko.observable(depVersion);
    this.depPlannedDateTime = ko.observable(depPlannedDateTime);
    this.depStatus = ko.observable(depStatus);
    this.depSmoke = ko.observable(depSmoke);
    this.depEnvironment = ko.observable(depEnvironment);
    this.Edit = ko.observable(Edit);
};
//Deploy viewmodel
var TempDeployViewModel = function (signalR) {

    var self = this;

    //Deploys array
    self.deploys = ko.observableArray();
    self.featureList = ko.observableArray();
    self.environmentList = ko.observableArray();
    self.tempTime = ko.observable(new Date());
    console.log("The temp time is: ", self.tempTime);

    //Observables for the NEW deploy fields
    self.feature = ko.observable();
    self.version = ko.observable();
    self.environment = ko.observable();
    self.plannedDateTime = ko.observable(new Date());

    //Computed observables(to split up datetime field)
    self.computedDate = ko.computed({
        write: function (val) {
            self.plannedDateTime(moment(val, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm'))
        },
        read: function () {
            return moment(self.plannedDateTime()).format('YYYY-MM-DD');
        }
    });
    self.computedTime = ko.computed({
        write: function (val) {
            self.plannedDateTime(moment(val, 'HH:mm').format('YYYY-MM-DDTHH:mm'))
        },
        read: function () {
            return moment(self.plannedDateTime()).format('HH:mm');
        }
    });


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

        var newRecord = [{

            depFeature: self.feature(),
            depVersion: self.version(),
            depPlannedDateTime: moment(self.plannedDateTime()).format(),
            depStatus: 'Queued',
            depSmoke: "Not Ready",
            depEnvironment: self.environment(),
            Edit: false

        }];

        if (feature.value.length == 0 || version.value.length == 0 || environment.value.length == 0 || plannedDate.value.length == 0 || plannedTime.value.length == 0) {
            alert('You must enter ALL fields');

        }
        else {
            var newDeploy = ko.utils.arrayMap(newRecord, function (data) {
                return new Deploy(data.depFeature, data.depVersion, data.depEnvironment, data.depPlannedDateTime, data.depStatus, data.depSmoke, data.Edit)
            });

            //Push the new record to the temp table
            self.deploys.push.apply(self.deploys, newDeploy);
            
            console.log(ko.toJSON(self.deploys));

        }
        
        //Empty the observables
        self.feature('');
        self.version('');
        self.environment('');
        

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

        //Initialize variables for notifications
        var icon = '/images/static_bulb.jpg';
        var message = "A new batch of deploys has been submitted to the queue.";
        signalR.server.notification("Batch", message, icon);

    };

    self.edit = function (deploys) {
        deploys.Edit(true);
        deploys.depPlannedDateTime(new Date(deploys.depPlannedDateTime()));
    };

    self.done = function (deploys) {
        deploys.Edit(false);
        deploys.depPlannedDateTime(moment(deploys.depPlannedDateTime()).format());
        console.log('done');
        console.log("Updated deploy: ", self.deploys);
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
    $("#txtPlannedDate").datepicker();
    $("#ctlPlannedDate").datepicker();
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
