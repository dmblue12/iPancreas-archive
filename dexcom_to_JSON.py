import argparse
import csv
import json
import util_time

class StudioReader():
    """Reads Dexcom Studio .csv export file and encodes to JSON."""

    def __init__(self, dex):

        self.dexcom = {'Calibrations': [], 'Readings': []}

        with open(dex, 'rb') as f:
            self.rdr = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_NONE)
            self.get_readings()

        with open(dex, 'rb') as f:
            self.rdr = csv.reader(f, delimiter='\t', quoting=csv.QUOTE_NONE)
            self.get_calibs()

        self.create_JSON()

    def get_readings(self):
        """Read blood glucose values and timestamps from Dexcom export file and save in a dict."""

        readings = self.dexcom['Readings']

        self.rdr.next()

        for row in self.rdr:
            numeric = row[4]
            if numeric == "Low":
                numeric = "39"
            elif numeric == "High":
                numeric = "401"
            readings.append({"timestamp": util_time.dexcom_to_ISO8601(row[3]), "blood_glucose": numeric})

    def get_calibs(self):
        """Read blood glucose calibrations and timestamps from Dexcom export file and save in a dict."""

        calibs = self.dexcom['Calibrations']

        self.rdr.next()

        for row in self.rdr:
            numeric = row[7]
            if numeric == "Low":
                numeric = "39"
            elif numeric == "High":
                numeric = "401"
            if numeric != "":
                calibs.append({"timestamp": util_time.dexcom_to_ISO8601(row[6]), "blood_glucose": numeric})

    def create_JSON(self):
        """Transfer BG objects to a JSON file."""

        with open("dexcom.json", 'w') as f:
            print >> f, json.dumps(self.dexcom, sort_keys=True, indent=4, separators=(',', ': '))

def main():
    parser = argparse.ArgumentParser(description='Process the input Dexcom Studio file.')
    parser.add_argument('-d', '--dexcom', action = 'store', dest = "dex_name", help='name of Dexcom Studio .csv file')

    args = parser.parse_args()

    d = StudioReader(args.dex_name)

if __name__ == '__main__':
    main()