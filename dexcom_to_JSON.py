import argparse
import csv
import json
import util_time

class StudioReader():
    """Reads Dexcom Studio .csv export file and encodes to JSON."""

    def __init__(self, dex, output = ""):

        self.dexcom = {'Calibrations': [], 'Readings': []}

        self.output_filename = output

        # store UTC offset if given on command line with Dexcom file
        try:
            self.offset = dex[1]
        except IndexError as i1:
            self.offset = None

        with open(dex[0], 'rb') as f:
            self.rdr = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_NONE)
            self._get_readings()

        with open(dex[0], 'rb') as f:
            self.rdr = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_NONE)
            self._get_calibs()

        self.create_JSON()

    def _get_readings(self):
        """Read blood glucose values and timestamps from Dexcom export file and save in a dict."""

        readings = self.dexcom['Readings']

        # skip first row of .csv file, since it contains labels, not values
        self.rdr.next()

        for row in self.rdr:
            numeric = row[4]
            # change non-integer stored blood glucose values to integers
            if numeric == "Low":
                numeric = "39"
            elif numeric == "High":
                numeric = "401"
            int_numeric = int(numeric)
            readings.append({"timestamp": util_time.dexcom_to_ISO8601(row[3]),
                "UTC_timestamp": util_time.dexcom_to_ISO8601(row[2], self.offset),
                "blood_glucose": int_numeric})

    def _get_calibs(self):
        """Read blood glucose calibrations and timestamps from Dexcom export file and save in a dict."""

        calibs = self.dexcom['Calibrations']

        # skip first row of .csv file, since it contains labels, not values
        self.rdr.next()

        for row in self.rdr:
            numeric = row[7]
            # change non-integer stored blood glucose values to integers
            if numeric == "Low":
                numeric = "39"
            elif numeric == "High":
                numeric = "401"
            if numeric != "":
                int_numeric = int(numeric)
                calibs.append({"timestamp": util_time.dexcom_to_ISO8601(row[6]),
                    "UTC_timestamp": util_time.dexcom_to_ISO8601(row[5], self.offset),
                    "blood_glucose": int_numeric})

    def create_JSON(self):
        """Transfer BG objects to a JSON file."""

        if self.output_filename:
            filename = self.output_filename
        else:
            filename = "dexcom.json"

        with open(filename, 'w') as f:
            print >> f, json.dumps(self.dexcom, sort_keys=True, indent=4, separators=(',', ': '))

def main():
    parser = argparse.ArgumentParser(description='Process the input Dexcom Studio file.')
    parser.add_argument('dexcom_file', nargs='+', action='store', help='name of Dexcom Studio \
        .csv file and optional Dexcom internal timezone offset as {+-}H')
    parser.add_argument('-o', '--output', action='store', dest='output', help="name of output file; default is 'dexcom.json'")

    args = parser.parse_args()

    if args.output:
        d = StudioReader(args.dexcom_file, args.output)
    else:
        d = StudioReader(args.dexcom_file)

def test_python():
    print "This is a test."

if __name__ == '__main__':
    main()