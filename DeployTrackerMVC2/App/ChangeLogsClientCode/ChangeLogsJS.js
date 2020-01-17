var Note = function (noteID, noteBody, noteDateTime) {
    this.noteID = noteID;
    this.noteBody = ko.observable(noteBody);
    this.noteDateTime = ko.observable(noteDateTime);
}

//Used for POST request compatability
var NewNote = function (noteBody, noteDateTime) {
    this.noteBody = noteBody;
    this.noteDateTime = noteDateTime;
}

var CLViewModel = function (signalR) {
    var self = this;
    self.changeLogs = ko.observableArray();
    self.selectedCL = ko.observableArray(self.changeLogs()[0]);

    //Fetch data
    $.getJSON('/odata/Notes', function (data) {
        self.changeLogs(ko.utils.arrayMap(data.value, function (changeLogs) {
            var obsChangeLog = {
                noteID: changeLogs.noteID,
                noteBody: ko.observable(changeLogs.noteBody),
                noteDateTime: ko.observable(changeLogs.noteDateTime)
            }
            return obsChangeLog;
        }))
    });

    //Update Function
    self.updateViewModel = function (payload) {
        console.log("payload: ", payload);
        var jvsObject = JSON.parse(payload);
        var newNote = new Note(jvsObject.noteID, jvsObject.noteBody, jvsObject.noteDateTime);
        self.changeLogs.push(newNote);
        self.watchModel(newNote, self.modelChanged);
        console.log("Updated viewmodel");
    };

    //Subscription Functions
    self.subscribeToProperty = function (model, key, callback) {
        model[key].subscribe(function (val) {
            console.log("self.subscribeToProperty");
            callback(key, val);
        });
    };
    self.watchModel = function (model, callback) {
        for (var key in model) {
            if (model.hasOwnProperty(key) && ko.isObservable(model[key])) {
                self.subscribeToProperty(model, key, function (key, val) {
                    callback(model, key, val);
                    console.log("self.watchModel()", callback(model, key, val));
                });
            }
        }
    }
    self.modelChanged = function (model, key, val) {
        var payload = {};
        payload[key] = val;
        console.log("self.modelChanged()", payload);
    };

    //Regular Functions
    self.select = function (data) {
        self.selectedCL(data);
        var clBody = ko.unwrap(self.selectedCL().noteBody);
        $("#previewWindow").html(clBody);
    }
    self.newChangeLog = function () {
        $("#firstPage").fadeOut("fast");
        $("#firstFooter").fadeOut("fast");
        $("#secondPage").fadeIn("fast");
        $("#secondFooter").fadeIn("fast");
        
    }
    self.back = function () {
        $("#secondPage").fadeOut("fast");
        $("#secondFooter").fadeOut("fast");
        $("#firstPage").fadeIn("fast");
        $("#firstFooter").fadeIn("fast");
        
    }
    self.cancel = function () {
        var textBody = tinymce.activeEditor.getContent({ format: 'html' });
        if (textBody != '') {
            var alert = confirm("This will cancel your note submission. Are you sure you want to continue?");
            if (alert == true) {
                
                $('textEditor').each(function (k, v) {
                    tinymce.get(k).setContent('');
                });
            }
            else {
                return null;
            }
        }
        self.back();
    };
    self.submitCL = function () {
        var textBody = tinymce.activeEditor.getContent({ format: 'html' });
        if (textBody == '') {
            alert("You cannot enter an empty note.");
            return;
        }
        var newNote = new NewNote(textBody, new Date());
        postNote(signalR, newNote);
        //Clean text editor
        $('textEditor').each(function (k, v) {
            tinymce.get(k).setContent('');
        });
        self.back();
    }

    //Computed Functions
    self.sortedChangeLogs = ko.computed(function () {
        var CLList = self.changeLogs();
        return CLList.sort(function (l, r) {
            return (l.noteDateTime() < r.noteDateTime() ? 1 : -1);
        });
    });
}

$(function () {
    var signalR = $.connection.deploy;
    var viewModel = new CLViewModel(signalR);

    var secondPage = document.getElementById("secondPage");
    var secondFooter = document.getElementById("secondFooter");

    signalR.client.updateNotes = function (payload) {
        viewModel.updateViewModel(payload);
    }

    $.connection.hub.start().done(function () {
        ko.applyBindings(viewModel);

        secondPage.style.display = "none";
        secondFooter.style.display = "none";

        //Initialize text editor
        tinymce.init({
            selector: '#textEditor',
            height: 575,
            init_instance_callback: function (editor) {
                console.log("Editor: " + editor.id + " is now initialized.");
            }
        });
        $("#textEditor").each(function (k, v) {
            tinymce.get(k).setContent('');
        });
    });

});

$(document).ready(function () {
    $("#loadingDiv").fadeOut();
});