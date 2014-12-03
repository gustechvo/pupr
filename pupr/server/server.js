
    Meteor.publish('thumbnails', function(){
       return Thumbnails.find({}); // publish the posts collection
    });

    Meteor.publish('shutter_triggers', function(){
        
       return Shutter_Triggers.find({}, {sort: {trigger_time:-1}, limit: 1}) 
        
    });