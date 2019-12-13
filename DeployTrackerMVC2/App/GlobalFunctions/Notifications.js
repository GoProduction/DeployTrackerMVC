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