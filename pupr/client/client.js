/**
 * Created with pupr.
 * User: gustechvo
 * Date: 2014-11-29
 * Time: 09:19 PM
 * Client Side Javascript for Pupr application
 */
// Photobooth_selected acts like a flag that initializes the photobooth.
// 
Session.set("Photobooth_selected", false);
Session.set("Gallery_selected", false);
Session.set("Remote_selected", false);
// The highest index read from the Thumbnails collection
Session.set("max_index", 0);
// Not currently used, but can be used to cycle through images in the slideshow.
Session.set("active_index", 0);
Session.set("webcam_live", false);
////////////////////////////////////////////////////////////
//Run on Meteor Client Startup
////////////////////////////////////////////////////////////
Meteor.startup(function() {
    //Subscribe to the thumbnails collection (contains all thumbnails)
    var images_loaded = Meteor.subscribe('thumbnails');
    //Subscribe to the Shutter Triggers collections (currently all triggers can be seen)
    //Need to limit collection to current session_phrase for security
    var shutter_triggers = Meteor.subscribe('shutter_triggers');
    //Initialize the Chance Random X generator
    var chance = new Chance();
    //Set the Session Phrase using Chance
    Session.set("session_phrase", chance.word({
        syllables: 3
    }));
    //Reset the last trigger time session variable
    Session.set("trigger_time", 0);
    //Set the local last_trigger_time variable to 0
    var last_trigger_time = 0;
    //Hook for setting Webcam_live flag
    Webcam.on('live', function() {
        console.log("Webcam is live");
        Session.set("webcam_live", true);
    });
    //Tracker Autorun 
    Tracker.autorun(function() {
        //Once the Thumnbails subscription is ready
        if(images_loaded.ready()) {
            //Continually update the max index to the max index seen in the collection
            var max_index = Thumbnails.find({}, {
                sort: {
                    img_index: -1
                },
                limit: 1
            });
            //Store the max index in a session variable
            if(max_index.fetch().length > 0) {
                var n = max_index.fetch()[0].img_index;
                Session.set("max_index", n);
                console.log("There are " + n + "images.");
            } else {
                console.log("There are no images.")
                Session.set("max_index", 0);
            }
        }
        //Once the Shutter_trigger subscription is ready
        if(shutter_triggers.ready()) {
            //Update last_trigger with the timestamp of the latest trigger in the colleciton
            var last_trigger = Shutter_Triggers.find({}, {
                sort: {
                    trigger_time: -1
                },
                limit: 1
            });
            if(last_trigger.fetch().length > 0) {
                last_trigger_time = last_trigger.fetch()[0].trigger_time;
                //Compare the new trigger (if any) to the stored Sesssion trigger time
                if(last_trigger_time > Session.get("trigger_time")) {
                    //Update the trigger_time session variable with the last trigger time
                    //This implies that the camera should be triggered
                    Session.set("trigger_time", last_trigger_time);
                    console.log("Triggered Remotely");
                    //Only if the Webcam is live at this point
                    if(Session.get("webcam_live")) {
                        console.log("Webcam is live, taking picture via Remote Trigger");
                        //Snap a picture which was triggered by a remote trigger
                        //Shoudl replace this function with a cleaner one (something more DRY)
                        Webcam.snap(function(data_uri) {
                            var img_index = Session.get("max_index") + 1;
                            Thumbnails.insert({
                                image_source: data_uri,
                                time: Date.now(),
                                img_index: img_index,
                            });
                        });
                    }
                }
            }
        }
    });
});
// The Body UI template will yield a Photobooth, a Gallery, or a Remote page 
Template.body_ui.helpers({
    // Used in Body UI Template #IF
    Photobooth: function() {
        return Session.get("Photobooth_selected");
    },
    // Used in Body UI Template #IF
    Gallery: function() {
        return Session.get("Gallery_selected");
    },
    // Used in Body UI Template #IF
    Remote: function() {
        return Session.get("Remote_selected");
    }
});
Template.splash.helpers({
    vertical_height: function() {
        return window.innerHeight * .6;
    },
    vertical_padding: function() {
        return window.innerHeight * .2;
    }
});
Template.webcam.rendered = function() {
    var cam = this.find('#my_camera');
    console.log("in webcam render template");
    console.log(cam);
    cam.style.height = ((window.innerHeight / 2) + "px");
    console.log(cam);
    console.log('In the webcam renderer');
    //var cam_width = window.innerWidth * .8;   
    //var cam_height = (cam_width/1.5);
    var cam_width = window.innerWidth * .48;
    var cam_height = cam_width * .75;
    //var cam_width = cam_height * 1.5;
    Webcam.set({
        width: cam_width,
        height: cam_height,
        //dest_width: 640,
        //dest_height: 480,
        image_format: 'jpeg',
    });
    console.log("About to attach camera");
    Webcam.attach('#my_camera');
}
Template.thumbnails.helpers({
    thumbnails: function() {
        return Thumbnails.find({}, {
            sort: {
                time: -1
            },
            limit: 4
        });
    }
});
Template.gallery_images.helpers({
    gallery_images: function() {
        return Thumbnails.find({}, {
            sort: {
                time: -1
            }
        });
    },
    image_width: window.innerWidth * .7
});
Template.gallery.rendered = function() {
    var d = document.getElementById("1");
    console.log(d);
    if(d != null) {
        d.className = d.className + " active";
        console.log(d.className);
    }
};
Template.navigation.events = {
    'click #PB_button': function(event) {
        Session.set("Photobooth_selected", true);
        Session.set("Gallery_selected", false);
        Session.set("Remote_selected", false);
    },
    'click #Gallery_button': function(event) {
        Session.set("Photobooth_selected", false);
        Session.set("Gallery_selected", true);
        Session.set("Remote_selected", false);
    },
    'click #Remote_button': function(event) {
        Session.set("Photobooth_selected", false);
        Session.set("Gallery_selected", false);
        Session.set("Remote_selected", true);
    }
};
Template.splash.events = {
    'click #PB_button': function(event) {
        Session.set("Photobooth_selected", true);
        Session.set("Gallery_selected", false);
        Session.set("Remote_selected", false);
    },
    'click #Gallery_button': function(event) {
        Session.set("Photobooth_selected", false);
        Session.set("Gallery_selected", true);
        Session.set("Remote_selected", false);
    },
    'click #Remote_button': function(event) {
        Session.set("Photobooth_selected", false);
        Session.set("Gallery_selected", false);
        Session.set("Remote_selected", true);
    }
}
Template.webcam.events = {
    'click #snapshot_button': function(event) {
        Webcam.snap(function(data_uri) {
            var img_index = Session.get("max_index") + 1;
            Thumbnails.insert({
                image_source: data_uri,
                time: Date.now(),
                img_index: img_index,
            });
        });
    }
};
Template.session_phrase.helpers({
    phrase: function() {
        return Session.get("session_phrase");
    }
});
Template.remote.helpers({
    remote_height: function() {
        console.log("Innher Height: " + window.innerHeight);
        return window.innerHeight;
    }
});
Template.remote.events({
    'click #remote_trigger': function() {
        Shutter_Triggers.insert({
            trigger_time: Date.now()
        });
        console.log("In the Remote Trigger event.");
    }
});
Template.navigation.rendered = function() {
    $('#PB_button').addClass('animated fadeIn');
    $('#Gallery_button').addClass('animated fadeIn');
    $('#Remote_button').addClass('animated fadeIn');
};
Template.navigation.destroyed = function() {
    $('#PB_button').addClass('animated fadeOut');
    $('#Gallery_button').addClass('animated fadeOut');
    $('#Remote_button').addClass('animated fadeOut');
};