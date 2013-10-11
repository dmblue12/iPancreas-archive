## About These Data Files

These data files represent 15 days of my own diabetes and contextual data. The data in all these files is free for public use (within the limitations of the license that applies to the repository within which this directory resides). However, I would appreciate an e-mail notifying me of and linking me to any analysis or visualization of this data.

If you have questions about the data format beyond the what's documented in this README, you may contact me, but please be patient if I do not respond immediately.

### Diabetes Export Files

The following files are exported directly from the software accompanying my various diabetes devices:

- `basal.csv` contains the basal insulin rate records from my Animas Ping insulin pump

	* I think the timestamped events of a basal rate of 0.00 in this file represent one or both of (a) suspensions of the pump while downloading data from it and (b) rewinding and priming the pump when changing infusion sites.

- `bg.csv` contains the blood glucose readings from my OneTouch Ping blood glucose meter

- `bolus.csv` contains the bolus insulin dose records from my Animas Ping insulin pump

- `carbs.csv` contains the carbohydrate consumption logs from my Animas Ping insulin pump

- `dexcom.csv` contains the data from my Dexcom Continuous Glucose Monitor

	* The `GlucoseInternalTime` and `MeterInternalTime` fields are in Dexcom's "home" timezone, which is (bizarrely) UTC+3.

	* The `GlucoseDisplayTime` and `MeterDisplayTime` are in UTC-4, as is all other data in this dataset.

- `tdd.csv` contains the Total Daily Dose records from my Animas Ping insulin pump

	* I believe duplicate dates occur when an infusion site change happened in the middle of a day. The TDD for a day with multiple records should be the sum of the records.

**NB:** The file `yfd.csv` also contains *more detailed* information on my bolus doses and carbohydrate consumption.

### Munged Dexcom Files

The files `dexcom.json` and `dexcom_days.json` were produced using the `dexcom_to_JSON.py` and `dexcom_stats.py` modules I developed in this repository.

- `dexcom.json` has no real advantage over the CSV file other than perhaps being more easily machine-read.

- `dexcom_days.json` groups the readings by day and contains added summary statistics for each day of data (including the Glycemic Variability Index and Patient Glycemic Status measures newly developed by Dexcom and described [here](http://www.diabetesmine.com/2012/11/a-new-view-of-glycemic-variability-how-long-is-your-line.html 'Diabetes Mine: A New View of Glycemic Variability: How Long is Your Line?')) and may be useful for that reason.

### Moves Export File

I tracked my activity over this fifteen-day period with the iPhone application [Moves](http://www.moves-app.com/ 'Moves: Activity Tracking without Gadgets') and used the [Moves Export](http://moves-export.herokuapp.com/ 'Moves Export App!') app by [Joost Plattel](http://www.jplattel.nl/ 'Joost Plattel') to export the raw JSON data, stored in `moves-export.json`.

However, to protect my own privacy as well as the privacy of those I interacted with during this fifteen-day period, I have anonymized the data in several ways:

- I have adjusted the latitude and longitude of all location markers by constant values. The 'shape' of the data thus remains unchanged, but you won't be able to put map tiles under it! (You can if you like, but it will just be boring ocean.)

- I have renamed the places I visited. (Fans of [Arrested Development](http://en.wikipedia.org/wiki/Arrested_Development_(TV_series) 'Wikipedia: Arrested Development') will recognize the place names.)

- I have removed Moves and Foursquare place identifiers.

**NB:** Data from the evening of September 17th through late afternoon of September 18th is missing because I broke my iPhone and had to get it replaced ;)

### your.flowingdata Export File

I also logged some of my activity (diabetes-related and not) via the Twitter-based [your.flowingdata](http://your.flowingdata.com/ 'your.flowingdata') service created by [Nathan Yau](http://flowingdata.com/about-nathan/ 'Flowing Data: Nathan Yau'). All of this data is stored in the file `yfd.csv`.

The actions I tracked with your.flowingdata are the following:

- `ate`: Food ingested with negligible carbohydrate content. Actual descriptions of food have been anonymized.

- `carbs`: Grams of carbohydrate ingested. Actual descriptions of food have been anonymized. Tags indicate my confidence level in the carbohydrate count:

	* `no_clue`: Completely guessing as to the carb count, often found with a `take_out` or `eating_out` tag.

	* `guesstimating`: For mid-level confidence in carb count.

	* `nutrition_facts`: When the carb count I used came from a Nutrition Facts label or weighing the food with my nutritional scale.

- `coffee`: Cups (8-10 oz.) of coffee drunk. Category indicates brewing method because I am a coffee nerd.

- `correction_bolus`: Insulin taken to counteract high blood glucose. Tagged `my_bad` if the hyperglycemia resulted from inaccurate carb-counting, forgotten meal bolus, etc. or `WTF` if the hyperglycemia was unexplained.

- `done_run`: Time stamp for when I returned home from a run.

- `hypo`: Episodes of hypoglycemia, tagged with `mild` (> 55 mg/dL, <= 65 mg/dL) or `severe` (<= 55 mg/dL), as well as with the method of treatment (e.g., `glucose_tabs`).

- `ibuprofen`: Dose of ibuprofen (in milligrams). Tag indicates reason.

- `meal_bolus`: Insulin taken when eating carbohydrates. Tagged `forgot` if I forgot to take the dose until *after* I ate.

	* The `coffee` tag indicates that I added to the recommended bolus in order to counteract the effect of caffeine on my blood glucose. (Usually this is a 0.5-unit addition.)

	* Dual-wave boluses are tagged `dual_wave` and also are tagged with the duration (e.g., `60min` for 60 minutes) and the percentage of the dose delivered immediately (e.g., `50percent`).

- `ran`: Miles run. Category indicates approximate pace, in fifteen-second intervals. So `sub1015` indicates a pace between 10:00-10:15 per mile. (Yes, I am a slow runner.) The category `slow` is a catch-all for any pace higher than 10:15 per mile.

### Sleep Cycle File

The file `sleep.csv` gives the time I went to bed, the time I got up, and my sleep quality as recorded by the iPhone app [Sleep Cycle](http://www.sleepcycle.com/ 'Sleep Cycle'). Note again that data from the night between September 17th and 18th is missing due to me breaking my iPhone.

### Calendar File

I've noted *some* of the events from my calendar, with names changed to protect the innocent, in the file `calendar.csv`. Times are extremely approximate.