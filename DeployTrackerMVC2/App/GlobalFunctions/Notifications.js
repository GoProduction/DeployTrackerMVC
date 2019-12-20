function assignIcon(value) {
    var pass = '/images/static_pass.jpg';
    var fail = '/images/static_fail.jpg';
    var conditional = '/images/static_conditional';
    var ready = '/images/static_loading.jpg';

    //Icon assignment
    if (value == 'Pass') {
        icon = pass;
    }
    else if (value == 'Conditional') {
        icon = conditional;
    }
    else if (value == 'Fail') {
        icon = fail;
    }
    else {
        icon = ready;
    }

    return icon;
}//Evaluate status and assign icon
function assignMessage(feature, version, environment, value) {
    var message = "User has updated " + feature + " " + version + " in " + environment + " to " + value;
    return message;
}//Creates message string
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