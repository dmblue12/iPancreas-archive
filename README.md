# IMPORTANT

This repository is **deprecated** as of May 15th, 2014. I'm updating the tools contained within in separate repositories, starting with [iPancreas-dexcom](https://github.com/jebeck/iPancreas-dexcom) (for Dexcom data utilities) and [iPancreas-data](https://github.com/jebeck/iPancreas-data) (solely to host diabetes data files released for public consumption).

## Repository Map

- Here on the `master` branch I'm developing the Python modules for munging Dexcom data (and soon, Animas Ping export files).

- The `d3` branch is where I develop demo visualizations with the JavaScript data visualization library [D3](http://d3js.org/ 'D3.js: Data-Driven Documents).

- The `desktop` branch is where I'm developing a [TideSDK](http://www.tidesdk.org/ 'TideSDK') desktop application (with [Backbone.js](http://backbonejs.org/ 'Backbone.js') as the framework) for anyone to load their diabetes data and view the visualizations that I've developed. This is very much a 'scratch my own itch' project with a potentially short lifespan: TideSDK is on its deathbed, and [its non-open source replacement](http://www.tidekit.com 'TideKit') may be vaporware or unsuitable.

- The `gh-pages` branch contains the [GitHub Pages](http://pages.github.com/ 'GitHub Pages') site for this project [`http://janabeck.com/iPancreas/`](http://janabeck.com/iPancreas/ 'iPancreas Project Site'). Eventually all the D3 visualizations get pushed to locations within `http://janabeck.com/iPancreas/examples/html/...` and added to the [gallery](http://janabeck.com/iPancreas/examples/html/gallery.html 'Dexcom Data: D3 Visualizations').

## Documentation: dexcom_to_JSON.py

### Usage

~~~~~
usage: dexcom_to_JSON.py [-h] [-o OUTPUT] [-p]
                         timezone dexcom_file [dexcom_file ...]

Process the input Dexcom Studio export file.

positional arguments:
  timezone              user timezone offset from UTC as {+-}H
  dexcom_file           name of Dexcom Studio .csv file and optional Dexcom
                        internal timezone offset as {+-}H

optional arguments:
  -h, --help            show this help message and exit
  -o OUTPUT, --output OUTPUT
                        name of output file; default is 'dexcom.json'
  -p, --pretty          pretty print JSON
~~~~~

### Argument Details

#### Required: timezone

The user's timezone offset from UTC time *must* be specified. The format for specification is `{+-}H(H)`, where either `+` or `-` is specified and a second digit is used for the hours only if necessary. Currently there is no support for fractional timezones. For example, the format for entering the UTC offset for Eastern Standard Time (EST) is `-5`. Currently all timezones are assumed to obey Daylight Savings Time on the U.S. schedule. (Yes, problematic. Sorry. The code for this is actually in `util_time`, in `UserTime.dst`, if you have a desperate need to fix it for your country's observation (or lack thereof) of Daylight Savings.)

#### Required: dexcom_file

Path to your Dexcom Studio .csv export file. Optionally you may also include the timezone offset from UTC for the Dexcom internal timestamps, if you know what this is. So far as I can tell (and have verified anecdotally from a few other users), the Dexcom Seven+ system used Pacific Daylight Time (PDT, UTC offset `-7`) as the UTC offset for the internal timestamps. For the Dexcom Platinum G4, on the other hand, the UTC offset for the internal timestamps seems to be `+3`, very inexplicably.

[*Digression: Why UTC +3?*

This is the timezone for many East African and Middle Eastern countries, including Iraq, as well as Belarus and the non-contiguous region of Russia (Kaliningrad, née Königsberg). It is a complete mystery to me why this should be the UTC offset for the Dexcom's internal timestamps...unless the receivers are now being manufactured in one of these countries?] /digression

#### Optional: help

As always, you can add `-h` or `--help` to get the above usage statement as a reminder of the possible arguments and their order and formatting specifications.

#### Optional: output file

If you don't want the output file to be named `dexcom.json`, which is the default option, then you can specify another output filename (and/or path) after including  a `-o` or `--output` flag.

#### Optional: pretty print JSON

Include the `-p` or `--pretty` flag to output human-readable JSON. The default is to minimize spaces and line breaks for a smaller file size (from 10MB to 6.5 for a source Dexcom file containing a little over six months of data).

### Example

The following code runs `dexcom_to_JSON.py` on the Dexcom G4 Platinum export file `export.csv` for a user living in the Eastern timezone in the U.S., writing to a file `output.json` in a human-readable format.

~~~~~
python dexcom_to_JSON.py -5 export.csv +3 -p -o output.json
~~~~~

### Running from Elsewhere

To run `dexcom_to_JSON` from another Python module or script, it is recommended to use the following:

~~~~~
from dexcom_to_JSON import StudioReader

rdr = StudioReader(dexcom_file, user_timezone, pretty, output_path, output_filename)
~~~~~

Where:

 - `dexcom_file` is a list containing (1) the path to the Dexcom Studio export .csv file and (2) the timezone offset from UTC for the specified Dexcom file (or `""` if none provided)

    + [Here you can also pass a list of lists (e.g., `[[dexcom_file1, UTC_offset1], [dexcom_file2, UTC_offset2], ...]`, but this is not a very sane or elegant solution to the problem of getting one `dexcom.json` output file from multiple import files; it's likely to change in future.]

 - `user_timezone` is the user's timezone offset from UTC as a string in {+-}H(H) format, as on the command line

 - `pretty` is a boolean indicating whether pretty printing to JSON is desired

 - `output_path` is the path to the directory where the output file should be saved, if output to the current working directory is not desired; use `""` if saving to the current working directory *is* desired

- `output_filename` is the (optional) desired filename for writing the output to, if the default `dexcom.json` is not desired

### Dependencies

Aside from `util_time`, which is also provided in this repository, all dependencies are part of the Python 2.7.* standard library. I'm not sure how backwards-compatible this module is, but it's definitely not (yet) forwards-compatible to Python 3.*. (It will be. Someday. When I get over the discomfort of having to type `print("Hello, world")`.)

## Documentation: dexcom_stats.py

### Usage

~~~~~
usage: dexcom_stats.py [-h] [-w] [-m] [-y] [-p] dex_name

Process the input Dexcom JSON file.

positional arguments:
  dex_name      name of Dexcom .json file

optional arguments:
  -h, --help    show this help message and exit
  -w, --weeks   generate dexcom_weeks.json output file
  -m, --months  generate dexcom_months.json output file
  -y, --years   generate dexcom_years.json output file
  -p, --pretty  pretty print JSON
~~~~~

### Argument Details

#### Required: dex_name

Path to the Dexcom JSON file that is the output from `dexcom_to_JSON`. Typically this will just be `dexcom.json` (in your current working directory).

#### Optional: help

As always, you can add `-h` or `--help` to get the above usage statement as a reminder of the possible arguments and their order and formatting specifications.

#### Optional: time unit flags

The default output is a JSON file `dexcom_days.json` containing daily-batched Dexcom data including the following:

- Date, as an ISO format string (yyyy-mm-dd)

- Calibrations, a list of timestamped (both UTC and user) blood glucose meter readings entered into the Dexcom for calibration

- Timestamped Readings, a list of timestamped (both UTC and user) Dexcom blood glucose readings

- Start Time, an [ISO 8601](http://en.wikipedia.org/wiki/ISO_8601 'Wikipedia: ISO 8601') format string representing the time and date of the first blood glucose reading (whether Dexcom reading or meter calibration) for the given day

- End Time, an ISO 8601 format string representing the time and date of the last blood glucose reading (whether Dexcom reading or meter calibration) for the given day

- Continuous, a boolean indicating whether the Dexcom data for this day is continuous---i.e., no gap > 6 minutes between blood glucose readings

- Continuous Segments, a list of lists of timestamped Dexcom blood glucose readings that are <= 6 minutes apart

    + Printing the continuous segments in addition to the Timestamped Readings is a huge duplication of data in the output JSON files, so I'll likely be changing the way I do this in future (i.e., identifying continuous segments by recording only their start and end timestamps).

- Blood Glucose Values, a list of bare (un-timestamped) Dexcom blood glucose readings

- Summary Statistics:

    + Min, the lowest Dexcom blood glucose reading of the day
    
    + Max, the highest Dexcom blood glucose reading of the day
    
    + Mean, the mean Dexcom blood glucose reading of the day
    
    + Median, the median of the day's Dexcom blood glucose readings
    
    + Quartiles, the quarter, half (median), and seventy-fifth percentiles of the distribution of Dexcom blood glucose readings
    
    + Standard Deviation, the standard deviation of the Dexcom blood glucose readings
    
    + Glycemic Variability Index (GVI), a new measure of blood glucose variability developed by Dexcom and described [here](http://www.diabetesmine.com/2012/11/a-new-view-of-glycemic-variability-how-long-is-your-line.html "DiabetesMine: A New View of Glycemic Variability: How Long Is Your Line?")
    
    + Patient Glycemic Status (PGS), a new overall measure of blood glucose control developed by Dexcom and again described at the link above
    
    > **NB:** Included in the formula for calculating PGS is the percentage of time in range (PTIR). I don't know what definition of "in range" Dexcom used in developing the PGS metric. I've hard-coded a range of 65 mg/dL to 140 mg/dL for now, but I intend to make this customizable in a settings file (or via the command line, or both) at a later date.
    
Nearly identical output, differing only in how the time unit is identified (i.e., using ISO week number instead of date to identify a week-long batch of Dexcom data), is produced when the appropriate flag is included as an option:

- `-w` for weekly-batched data written to `dexcom_weeks.json`

- `-m` for monthly-batched data written to `dexcom_months.json`

- `-y` for yearly-batched data written to `dexcom_years.json`

#### Optional: pretty print JSON

Include the `-p` or `--pretty` flag to output human-readable JSON. The default is to minimize spaces and line breaks for a smaller file size.

### Example

The following code runs `dexcom_stats.py` on the file `dexcom.json` resulting from a successful run of `dexcom_to_JSON.py`. It writes to the files `dexcom_days.json`, `dexcom_weeks.json`, `dexcom_months.json`, and `dexcom_years.json` in a human-readable format.

~~~~~
python dexcom_stats.py dexcom.json -w -m -y -p
~~~~~

### Running from Elsewhere

To run `dexcom_stats` from another Python module or script, it is recommended to use the following:

~~~~~
from dexcom_stats import DexcomStats

d = DexcomStats(dex_name, [weeks_boolean, months_boolean, years_boolean])
~~~~~

Where:

- `dex_name` is the path to the Dexcom JSON file output from `dexcom_to_JSON`

- `weeks_boolean` is `True` if a weekly-batched output file of Dexcom data is desired and `False` otherwise, etc.

> **NB:** In order to print any batched data (including the default of daily batches), you must make a call to `DexcomStats.print_unit_JSON(unit, pretty)` where `unit` is the units you desire in your output(s) (days, weeks, months, or years) and `pretty` is a boolean indicating whether or not you desire pretty printing of the resulting JSON.

### Dependencies

Like `dexcom_to_JSON`, `dexcom_stats` depends on `util_time` included in this repository. It also depends on `numpy` and `pandas`, which are not included in the Python standard library. Information on installing these can be found at [the SciPy website](http://www.scipy.org/install.html 'SciPy: Install').

Copyright 2013 Jana E. Beck  
Contact: jana.eliz.beck@gmail.com

## License

The software tools in this repository are free software: you can redistribute them and/or modify them under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

These programs are distributed in the hope that they will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

## About

The software tools in this repository are provided as aids for extracting data from files exported from the software that comes with certain diabetes-related medical devices (namely, continuous glucose monitors and insulin pumps) and visualizing that data. None of the tools in this repository is intended to substitute for professional medical advice regarding your diabetes care. Consult with your health care provider before making any treatment decisions or changes.
