var NodeHelper = require("node_helper");
var PouchDB    = require("pouchdb");
var cmd        = require("node-cmd");
//var rc522      = require("rc522");



module.exports = NodeHelper.create({
    start: function() {
        var db = new PouchDB("kids_times");
    },
    socketNotificationReceived: function(notification) {
        console.log("socketNotificationReceived");
        var self = this;
        if( notification === 'ADD_TIME') {
            console.log("ADD_TIME hit");
            self.sendSocketNotification("ADD_TIME_HIT");
            //self.currentNotification = "This is a test";
            
            return;
//            this.addTimeEntry(payload);
        }
    },

    /* getDiId() 
     * Get the ID of the Disney Infinity character via RFID reader
     *
     */
    getDiId: function() {
        //var self = this;
        /*cmd.get(
            'sudo python vendor/MFRC522/Read.py',
            function(err, data, stderr) {
                self.sendSocketNotification("getDiId_FINISHED", data);
            }
        );*/
        var response = "getDiId hit";
        return response;
        cmd.get(
            'sudo python vendor/MFRC522/Read.py',
            function(err, data, stderr) {
                response = data;
            }
        );
        return response;
    },
    
    /* addTimeEntry(data)
     * Add time entry to database
     *
     * data: {
     *     dbId: STRING,
     *     start: INT,
     *     end: INT
     * }
     */
    addTimeEntry: function(data) {
        console.log('addTimeEntry hit');
        db.put(data, function (error, result) {
            if(!error) {
                db.allDocs({include_docs: true, descending: true}, function(error, doc) {
                    console.log(doc.rows);
                    return doc.rows;
                });
            }
        });
    }

});
