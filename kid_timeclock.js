/* global Log, Module, moment */

/* Magic Mirror
 * Module: Compliments
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */
Module.register("kid_timeclock", {

	// Module config defaults.
	defaults: {
		compliments: {
			anytime: [
				"Hey there sexy!"
			],
			morning: [
				"Good morning, handsome!",
				"Enjoy your day!",
				"How was your sleep?"
			],
			afternoon: [
				"Hello, beauty!",
				"You look sexy!",
				"Looking good today!"
			],
			evening: [
				"Wow, you look hot!",
				"You look nice!",
				"Hi, sexy!"
			]
		},
		updateInterval: 4000,
		remoteFile: null,
		fadeSpeed: 3000
	},

	// Set currentweather from module
	currentWeatherType: "",

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

    cmd: require("node-cmd"),

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.lastComplimentIndex = -1;

		if (this.config.remoteFile != null) {
			this.complimentFile((response) => {
				this.config.compliments = JSON.parse(response);
			});
		}

		// Schedule update timer.
		var self = this;
		setInterval(function() {
			self.updateDom(self.config.fadeSpeed);
		}, this.config.updateInterval);
	},

    socketNotificationReceived: function(notification, payload) {
        var self = this;
        if (notification === "ADD_TIME_HIT") {
            self.currentNotification = "This is a test hit";
        }
        else if (notification === "getDiId_FINISHED") {
            self.currentNotification = "getDiId_FINISHED";
            Log.info(payload);
        }
    },

	/* randomIndex(compliments)
	 * Generate a random index for a list of compliments.
	 *
	 * argument compliments Array<String> - Array with compliments.
	 *
	 * return Number - Random index.
	 */
	randomIndex: function(compliments) {
		if (compliments.length === 1) {
			return 0;
		}

		var generate = function() {
			return Math.floor(Math.random() * compliments.length);
		};

		var complimentIndex = generate();

		while (complimentIndex === this.lastComplimentIndex) {
			complimentIndex = generate();
		}

		this.lastComplimentIndex = complimentIndex;

		return complimentIndex;
	},

	/* complimentArray()
	 * Retrieve an array of compliments for the time of the day.
	 *
	 * return compliments Array<String> - Array with compliments for the time of the day.
	 */
	complimentArray: function() {
		var hour = moment().hour();
		var compliments;

		if (hour >= 3 && hour < 12 && this.config.compliments.hasOwnProperty("morning")) {
			compliments = this.config.compliments.morning.slice(0);
		} else if (hour >= 12 && hour < 17 && this.config.compliments.hasOwnProperty("afternoon")) {
			compliments = this.config.compliments.afternoon.slice(0);
		} else if(this.config.compliments.hasOwnProperty("evening")) {
			compliments = this.config.compliments.evening.slice(0);
		}

		if (typeof compliments === "undefined") {
			compliments = new Array();
		}

		if (this.currentWeatherType in this.config.compliments) {
			compliments.push.apply(compliments, this.config.compliments[this.currentWeatherType]);
		}

		compliments.push.apply(compliments, this.config.compliments.anytime);

		return compliments;
	},

	/* complimentFile(callback)
	 * Retrieve a file from the local filesystem
	 */
	complimentFile: function(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open("GET", this.file(this.config.remoteFile), true);
		xobj.onreadystatechange = function() {
			if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	},

	/* complimentArray()
	 * Retrieve a random compliment.
	 *
	 * return compliment string - A compliment.
	 */
	randomCompliment: function() {
		var compliments = this.complimentArray();
		var index = this.randomIndex(compliments);

		return compliments[index];
	},

	// Override dom generator.
	getDom: function() {
        var self = this;
		//var complimentText = this.randomCompliment();
		var complimentText = "this test";

		var compliment = document.createTextNode(complimentText);
		var wrapper = document.createElement("div");
		wrapper.className = this.config.classes ? this.config.classes : "thin xlarge bright";
//		wrapper.appendChild(compliment);

        var notification = document.createTextNode(self.getDiId());

		wrapper.appendChild(notification);
        /*
        var myWrapper = document.createElement("div");
        var num = 1;
        myWrapper.appendChild(document.createTextNode(num.toString()));
        return myWrapper;
        */
		return wrapper;
	},



	// From data currentweather set weather type
	setCurrentWeatherType: function(data) {
		var weatherIconTable = {
			"01d": "day_sunny",
			"02d": "day_cloudy",
			"03d": "cloudy",
			"04d": "cloudy_windy",
			"09d": "showers",
			"10d": "rain",
			"11d": "thunderstorm",
			"13d": "snow",
			"50d": "fog",
			"01n": "night_clear",
			"02n": "night_cloudy",
			"03n": "night_cloudy",
			"04n": "night_cloudy",
			"09n": "night_showers",
			"10n": "night_rain",
			"11n": "night_thunderstorm",
			"13n": "night_snow",
			"50n": "night_alt_cloudy_windy"
		};
		this.currentWeatherType = weatherIconTable[data.weather[0].icon];
	},


	// Override notification handler.
	notificationReceived: function(notification, payload, sender) {
		if (notification == "CURRENTWEATHER_DATA") {
			this.setCurrentWeatherType(payload.data);
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
        var response = "a";
        this.cmd.get(
            'sudo python vendor/MFRC522/Read.py',
            function(err, data, stderr) {
                response = "cmd.get run";
                //response = data;
            }
        );
        return response;
    },
    
    /* addTimeEntry(data)
     * Add time entry to database
     *
     * data: {
     *     diId: STRING,
     *     start: INT,
     *     end: INT
     * }
     */
    addTimeEntry: function(data) {
        console.log('addTimeEntry hit');
        db.put(data, function (error, result) {
            // FOR TESTING
            if(!error) {
                db.allDocs({include_docs: true, descending: true}, function(error, doc) {
                    console.log(doc.rows);
                    return doc.rows;
                });
            }
        });
    },
    
    /* createTempTimeEntry(data)
     * Create temporary time entry to be used as the store that adding new entries can compare against
     *
     * data: {
     *     diId: STRING,
     *     start: INT
     * }
     */
    createTempTimeEntry: function(data) {
        data.temp = true;
        db.post(data, function (err, resp) {
            
        });
    },

    /* getCurrentTimeEntry()
     * Get the current time entry
     * 
     * Returns:
     * resp: {
     *     temp: true,
     *     diId: STRING,
     *     start: INT
     * }
     */
    getCurrentTimeEntry: function() {
        //db.get();
    }

});
