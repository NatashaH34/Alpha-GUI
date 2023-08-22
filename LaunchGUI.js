var Jobfile = {};
var result = {};

//initial set up for the select2 addon and hidden parameters
$(document).ready(
    function () {
        $('.multy').select2();
        $('.selects').hide();
    }
);

//arrow function to retrieve value from deeply nested objects, returns null if key does not exist
//Usage: get([key1, key2, key3, ...], obj_name)
const get = (path, obj) => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);

// arrow function to check existance of key in deeply nested objects, returns false if key does not exist
// usage: get([key1, key2, key3, ... , key_to_check], obj_name)
const check = (path, obj) => (path.reduce((xs, x) => (xs && xs.hasOwnProperty(x)) ? xs[x] : false, obj) !== false);

function set(path, obj, setValue) {
    if (check(path, obj)) {
        for (let i = 0; i < path.length - 1; i++) {
            obj = obj[path[i]];
        }
        obj[path[path.length - 1]] = setValue;
    }
}

function isEmpty(obj) {
    // this function checks if object is empty
    return Object.keys(obj).length === 0;
}

function getJobfile() {
    //Handles http request and initial setting of parameters that will autofill
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            result = JSON.parse(this.responseText);
            Jobfile = get(["Jobfile"], result);
            var id = get(["_id"], result);

            var topoOptions = get(["topologies"], result);
            set_drpdown_opt_with_headings("topodrop", topoOptions, 'Node Topologies');

            var config = get(["Workflow", "run_type"], Jobfile);
            var topology = get(["Job Name", "Topology"], Jobfile);
            var test_suite = get(["Job Name", "test_suite"], Jobfile);
            var upgrade = get(["Upgrade Options", "upgrade"], Jobfile);
            var releaseFromDesigner = get(["Upgrade Options", "designer_from_path"], Jobfile);
            var releaseToDesigner = get(["Upgrade Options", "designer_to_path"], Jobfile);
            var upgradeNode = get(["Upgrade Options", "upgrade_node"], Jobfile);
            var craft = get(["Upgrade Options", "craft"], Jobfile);
            var minimal = get(["Upgrade Options", "minimal"], Jobfile);
            var launchsim = get(["Launch Options", "launch_sims"], Jobfile);
            var killsim = get(["Launch Options", "kill_sims"], Jobfile);
            var build = get(["Launch Options", "image_type"], Jobfile);
            var launchRelease = get(["Launch Options", "release"], Jobfile);
            var launchBaseline = get(["Launch Options", "baseline"], Jobfile);
            var potsPath = get(["Launch Options", "git_workspace_pots"], Jobfile);
            var ptsPath = get(["Launch Options", "git_workspace_pts"], Jobfile);
            var email = get(["email"], Jobfile);
            var emailSubject = get(["email_subject"], Jobfile);

            var releaseCodes = get(["Upgrade Options", "build_from_release"], Jobfile);
            var releaseFrom;
            var releaseBaseline;
            if (releaseCodes instanceof Array) {
                for (let i = 0; i < releaseCodes.length && i < 1; i++) {
                    // releaseFrom = /\d\d\d\d/.exec(releaseCodes[i]);
                    // releaseBaseline = /\D\D/.exec(releaseCodes[i]);
                    var releaseCode = releaseCodes[i];
                }
            }

            var releaseToCode = get(["Upgrade Options", "build_to_release"], Jobfile);
            var releaseTo = /\d\d\d\d/.exec(releaseToCode);
            var releaseToBaseline = /\D\D/.exec(releaseToCode);

            if (topology !== null) document.getElementById("topodrop").value = topology;
            $('#topodrop').trigger('change');

            if (upgradeNode !== null) document.getElementById("selectTopoNode").value = upgradeNode;
            $('#selectTopoNode').trigger('change');

            if (launchsim !== null) document.getElementById("launchsim").value = launchsim;
            if (killsim !== null) document.getElementById("killsim").value = killsim;
            if (build !== null) document.getElementById("build").value = build;
            if (launchRelease !== null) document.getElementById("launchRelease").value = launchRelease;
            if (launchBaseline !== null) document.getElementById("launchBaseline").value = launchBaseline;
            if (potsPath !== null) document.getElementById("potspath").value = potsPath;
            if (ptsPath !== null) document.getElementById("ptspath").value = ptsPath;
            if (upgrade !== null) document.getElementById("upgrade").value = upgrade;
            if (config !== null) document.getElementById("configdrop").value = config.toLowerCase();
            if (provisiondevice !== null) document.getElementById("provisiondevice").value = provisiondevice; //NEW
            if (releaseCode !== null) document.getElementById("releaseBaseline").value = releaseCode;
            if (releaseToCode !== null) document.getElementById("releaseToBaseline").value = releaseToCode;
            if (releaseFromDesigner !== null) document.getElementById("releaseDesigner").value = releaseFromDesigner;
            if (releaseToDesigner !== null) document.getElementById("releaseToDesigner").value = releaseToDesigner;
            if (email !== null) document.getElementById("email").value = email;
            if (emailSubject !== null) document.getElementById("email_subject").value = emailSubject;

            changeLayout();
        }
    };
    xhttp.open("POST", "/getjobfile", true);
    xhttp.send();
}

function changeLayout() {
    // default function to change the layout of the html, use if major changes have been made to the html

    $('.selects').hide();
    let testsuite = $('.testSuite');
    let runType = document.getElementById('configdrop');
    let designer = document.getElementById('designer');
    let upgrade = document.getElementById('upgrade');
    upgrade.disabled = false;

    let upgradeValue = upgrade.options[upgrade.selectedIndex].value;
    let runTypeValue = runType.options[runType.selectedIndex].value;
    let testOptions = get(["test_suites"], result);

    switch (runTypeValue) {
        case 'upgrade':
            testsuite.show();
            upgrade.value = 'yes';
            upgrade.disabled = true;
            testOptions = get(["upgrade_test_suites"], result);
            break;
        case 'topology':
            $('.topology').show();
            testOptions = [];
            if (upgradeValue === 'yes')
                $('.upgradeTopology').show();
            break;
        case 'devtest':
            testsuite.show();
            upgrade.value = 'no';
            upgrade.disabled = true;
            testOptions = get(["dev_test_suites"], result);
            break;
        case 'test':
            testsuite.show();
            upgrade.value = 'no';
            upgrade.disabled = true;
            break;
        default:
            break;
    }

    // shows or hides values for designer loads when upgrade is yes
    upgradeValue = upgrade.options[upgrade.selectedIndex].value;
    let designerValue = designer.options[designer.selectedIndex].value;
    if (upgradeValue === 'yes') {
        $('.upgrade').show();
        if (designerValue === 'yes') {
            $('.upgradeDesigner').show();
        } else {
            $('.upgradeNonDesigner').show();
        }
    }

    // sets options for the test suites dropdown
    let testdrop = $('#testdrop');
    remove_elements("testdrop");
    set_drpdown_opt("testdrop", testOptions);
    testdrop.val(get(["Job Name", "test_suite"], Jobfile));
    testdrop.trigger('change');

    change_topology_layout();
}

function change_topology_layout() {
    // separate function to handle the change in layout of the topology section due to its heavy logic

    let topology = document.getElementById("topodrop");
    let confirm = document.getElementById("topo_confirm");
    let profile = document.getElementById("topoprofile");
    let topoConfigGroup = $('#topoconfig_group');

    remove_elements("topoprofile");
    check_and_set_profiles_dropdown("topoprofile", get(["configs", topology.value.toString()], result), get(["Job Name", "Profile"], Jobfile));
    change_topology_config_layout();

    if (confirm.value === "yes") {
        topoConfigGroup.show();
    } else {
        topoConfigGroup.hide();
    }
}

function change_topology_config_layout() {
    // change available configuration files according to which profile has been activated

    let topology = document.getElementById('topodrop');
    let profile = document.getElementById('topoprofile');

    // remove everything within topoconfig and add new dropdowns according to how many options are available
    remove_elements("topoconfig");
    if (check(["configs", topology.value.toString(), profile.value], result)) {
        create_multidrop("topoconfig", get(["configs", topology.value.toString(), profile.value], result));
        // set_multidrop_from_Obj("topoconfig", get(["configs", topology.value.toString(), profile.value], Jobfile));
    } else {
        create_multidrop("topoconfig", get(["configs", topology.value.toString()], result));
        // set_multidrop_from_Obj("topoconfig", get(["configs", topology.value.toString()], Jobfile));
    }


    $('#topoconfig').trigger('change');
}

function auto_fill_release() {
    var launchRelease = get(["recent_releases", "current_release", "release"], result);
    var launchBaseline = get(["recent_releases", "current_release", "baseline"], result);
    if (launchRelease !== null && launchBaseline !== null) {
        document.getElementById("launchRelease").value = launchRelease;
        document.getElementById("launchBaseline").value = launchBaseline;
        document.getElementById("releaseBaseline").value = launchRelease + launchBaseline;
    }
}

function set_dropdown(dropdownID, selectString) {
    // function for setting dropdowns for some exceptional dropdowns, usually just setting element.value is enough
    let dropdown = document.getElementById(dropdownID);
    for (let i = 0; i < dropdown.length; i++) {
        if (dropdown.options[i].value === selectString) {
            dropdown.selectedIndex = i;
        }
    }
}

function remove_elements(dropdownID) {
    // removes everything within an element
    let el = document.getElementById(dropdownID);
    while (el.lastChild) {
        el.removeChild(el.lastChild);
    }
}

function set_drpdown_opt(dropdownID, options) {
    // create options within dropdown
    if (options === null) {
        return
    }
    let sel = document.getElementById(dropdownID);
    for (let i = 0; i < options.length; i++) {
        // create new option element
        var opt = document.createElement('option');

        // create text node to add to option element (opt)
        opt.appendChild(document.createTextNode(options[i]));
        sel.appendChild(opt);
    }
}

function set_drpdown_opt_with_headings(dropdownID, topoOptions, headingTag) {
    // set options for dropdown with headings for different types options
    if (!(topoOptions instanceof Object) || topoOptions instanceof Array)
        return;
    let sel = document.getElementById(dropdownID);
    for (let [key, value] of Object.entries(topoOptions)) {
        var optgrp = document.createElement("OPTGROUP");
        optgrp.label = key + headingTag;
        for (let i = 0; i < value.length; i++) {
            // create new option element
            var opt = document.createElement('option');

            // create text node to add to option element (opt)
            opt.appendChild(document.createTextNode(value[i]));
            optgrp.appendChild(opt);
        }
        sel.appendChild(optgrp);
    }
}

function check_and_set_profiles_dropdown(dropdownID, topoObj, selectedName) {
    // set dropdown for profile specific use, due to the fact the profile and config files are in the same location

    let profile = document.getElementById(dropdownID);
    let opt = document.createElement("option");

    opt.value = "None";
    opt.selected = true;
    opt.appendChild(document.createTextNode("No profile"));
    profile.appendChild(opt);

    if (!(topoObj instanceof Object) || topoObj instanceof Array) {
        return;
    }
    for (let [key, value] of Object.entries(topoObj)) {
        if (value instanceof Object && !(value instanceof Array)) {
            opt = document.createElement("option");
            opt.appendChild(document.createTextNode(key));
            profile.appendChild(opt);
        }
    }

    if (check([selectedName], topoObj)) {
        profile.value = selectedName;
    }
}

function create_multidrop(divID, optionObj) {
    // this function creates multiple drop downs according the the object given

    if (!(optionObj instanceof Object) || optionObj instanceof Array) {
        return
    }
    let grp = document.getElementById(divID);
    for (let [key, value] of Object.entries(optionObj)) {
        // create new select
        if (value instanceof Array) {
            let tag = document.createElement('label');
            tag.setAttribute('class', 'mt-3');
            tag.innerText = key;
            grp.appendChild(tag);
            let sel = document.createElement('select');
            sel.setAttribute('class', 'form-control');
            sel.id = key;
            let opt = document.createElement("option");
            opt.appendChild(document.createTextNode("None"));
            opt.value = "None";
            sel.appendChild(opt);
            // create new option element
            grp.appendChild(sel);
            set_drpdown_opt(sel.id, value);
        }
    }
}

function getMultipleSelected(dropDownID) {
    // function is used for retrieving select2 multiple selected option
    var selected = [];
    var dropdown = document.getElementById(dropDownID);
    for (var i = 0, len = dropdown.options.length; i < len; i++) {
        opt = dropdown.options[i];
        if (opt.selected) {
            selected.push(opt.text);
        }
    }
    return selected;
}

function split_and_remove_whitespace(string) {
    // this splits a string and puts the elements in array form
    var array = string.split(",");
    for (let i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }
    return array;
}

function set_multidrop_from_Obj(divID, Obj) {
    // this is used to set multiple dropdowns within a div using an object with keys corresponding to the element ID
    // and value corresponding to the chosen option
    for (let i = 0, sims = document.getElementById(divID).children; i < sims.length; i++) {
        if (sims[i].nodeName === 'SELECT' && check([sims[i].id], Obj)) {
            sims[i].value = get([sims[i].id], Obj);
        }
    }
}

function get_multidrop_as_Obj(divID) {
    configs = {};
    for (let i = 0, sims = document.getElementById(divID).children; i < sims.length; i++) {
        if (sims[i].nodeName === 'SELECT') {
            if (sims[i].value !== "None")
                configs[sims[i].id] = [sims[i].value];
        }
    }
    return configs;
}

function createJobfile() {
    var configs = get_multidrop_as_Obj("topoconfig");

    if (check(["Workflow", "run_type"], Jobfile)) Jobfile["Workflow"]["run_type"] = document.getElementById("configdrop").value;
    if (check(["Workflow, "collect_provision_device"], Jobfile)) Jobfile["Workflow"]["collect_provision_device"] = document.getElementById("provision_device").checked ? "Yes" : "No";
    if (check(["Workflow, "collect_hardware_setup"], Jobfile)) Jobfile["Workflow"]["collect_hardware_setup"] = document.getElementById("hardware_setup").checked ? "Yes" : "No";
    if (check(["Job Name", "Configurations"], Jobfile)) Jobfile["Job Name"]["Configurations"] = configs;
    if (check(["Job Name", "Profile"], Jobfile)) Jobfile["Job Name"]["Profile"] = document.getElementById("topoprofile").value;
    if (check(["Job Name", "Topology"], Jobfile)) Jobfile["Job Name"]["Topology"] = document.getElementById("topodrop").value;
    if (check(["Job Name", "test_suite"], Jobfile)) Jobfile["Job Name"]["test_suite"] = getMultipleSelected("testdrop");
    if (check(["Upgrade Options", "upgrade"], Jobfile)) Jobfile["Upgrade Options"]["upgrade"] = document.getElementById("upgrade").value;
    //TODO: make designer_from_path take a list of multiple possible paths
    if (check(["Upgrade Options", "build_from_release"], Jobfile)) Jobfile["Upgrade Options"]["build_from_release"] = split_and_remove_whitespace(document.getElementById("releaseBaseline").value.toString());
    if (check(["Upgrade Options", "build_to_release"], Jobfile)) Jobfile["Upgrade Options"]["build_to_release"] = document.getElementById("releaseToBaseline").value;
    if (check(["Upgrade Options", "designer_from_path"], Jobfile)) Jobfile["Upgrade Options"]["designer_from_path"] = document.getElementById("releaseDesigner").value;
    if (check(["Upgrade Options", "designer_to_path"], Jobfile)) Jobfile["Upgrade Options"]["designer_to_path"] = document.getElementById("releaseToDesigner").value;
    if (check(["Upgrade Options", "upgrade_node"], Jobfile)) Jobfile["Upgrade Options"]["upgrade_node"] = getMultipleSelected("selectTopoNode");
    if (check(["Launch Options", "launch_sims"], Jobfile)) Jobfile["Launch Options"]["launch_sims"] = document.getElementById("launchsim").value;
    if (check(["Launch Options", "image_type"], Jobfile)) Jobfile["Launch Options"]["image_type"] = document.getElementById("build").value;
    if (check(["Launch Options", "kill_sims"], Jobfile)) Jobfile["Launch Options"]["kill_sims"] = document.getElementById("killsim").value;
    if (check(["Launch Options", "release"], Jobfile)) Jobfile["Launch Options"]["release"] = document.getElementById("launchRelease").value;
    if (check(["Launch Options", "baseline"], Jobfile)) Jobfile["Launch Options"]["baseline"] = document.getElementById("launchBaseline").value;
    if (check(["Launch Options", "git_workspace_pots"], Jobfile)) Jobfile["Launch Options"]["git_workspace_pots"] = document.getElementById("potspath").value;
    if (check(["Launch Options", "git_workspace_pts"], Jobfile)) Jobfile["Launch Options"]["git_workspace_pts"] = document.getElementById("ptspath").value;
    if (check(["Debug Options", "collect_ctf_traces"], Jobfile)) Jobfile["Debug Options"]["collect_ctf_traces"] = document.getElementById("ctf_traces").checked ? "Yes" : "No";
    set(["Workflow", "collect_provision_device"], Jobfile, document.getElementById("provision_device").checked ? "yes" : "no"); //NEW
    set(["Workflow", "collect_hardware_setup"], Jobfile, document.getElementById("hardware_setup").checked ? "yes" : "no");
    set(["Debug Options", "dump_logs_directory"], Jobfile, document.getElementById("dump_log").value);
    set(["Debug Options", "collect_ctf_traces"], Jobfile, document.getElementById("ctf_traces").checked ? "yes" : "no");
    set(["Debug Options", "collect_saos_logs"], Jobfile, document.getElementById("saos_logs").checked ? "yes" : "no");
    set(["Debug Options", "collect_rtrv_logs"], Jobfile, document.getElementById("rtrv_logs").checked ? "yes" : "no");
    set(["Debug Options", "stop_on_failure"], Jobfile, document.getElementById("stop_on_failure").checked ? "yes" : "no");
    set(["Debug Options", "pause_on_failure"], Jobfile, document.getElementById("pause_on_failure").checked ? "yes" : "no");
    if (check(["email"], Jobfile)) Jobfile["email"] = split_and_remove_whitespace(document.getElementById("email").value);
    if (check(["email_subject"], Jobfile)) Jobfile["email_subject"] = document.getElementById("email_subject").value.toString();

    if (check(["Jobfile"], result)) result["Jobfile"] = Jobfile;

    // document.getElementById("results").innerText = JSON.stringify(result);

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("The form has been sent, please close the window to launch");
            window.close();
        }
    };
    xhttp.open("POST", "/updatejobfile", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(result));
}
