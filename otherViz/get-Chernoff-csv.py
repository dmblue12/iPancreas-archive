import csv
import json

def main():
	"""Create a .csv from a Dexcom JSON that R's Chernoff faces library can read."""

	out_file = open('june_summary.csv', 'w')

	header = ['date', 'min', 'max', 'mean', 'median', 'sd', 'gvi', 'pgs']

	wrtr = csv.writer(out_file)

	wrtr.writerow(header)

	with open('../dexcom_days.json', 'r') as f:
		all_days = json.load(f)
		for day in all_days['Days']:
			if day['Date'].startswith('2013-06'):
				ss = day['Summary Statistics']
				wrtr.writerow([day['Date'], ss['Min'], ss['Max'], ss['Mean'], ss['Median'], ss['Standard Deviation'], ss['Glycemic Variability Index'], ss['Patient Glycemic Status']])

if __name__ == '__main__':
	main()