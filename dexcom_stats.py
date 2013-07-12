import argparse
import json
import math
import numpy
import pandas
import util_time

class DexcomStats():
	"""Compute summary statistics for a Dexcom JSON file."""

	def __init__(self, dex):

		with open(dex, 'rb') as f:
			self.dexcom = json.load(f)

		self.calibrations = self.dexcom['Calibrations']

		self.readings = self.dexcom['Readings']

		# of these, only using self.start_date so far, but the rest could be potentially useful?
		self.start_time, self.start_date = util_time.get_start_time(self.calibrations[0]['timestamp'], 
			self.readings[0]['timestamp'])

		self.end_time, self.end_date = util_time.get_end_time(self.calibrations[-1]['timestamp'], 
			self.readings[-1]['timestamp'])

		# dict of DexcomDay objects, keyed by Python date()
		self.days = {}

		# method to split data into DexcomDay objects
		self._split()

		# following four lines allow for looping through self.days dict in sequential date order
		self.dates = []
		for day in self.days.values():
			if type(day.date) != type('abc'):
				self.dates.append(day.date)
			else:
				print "Empty Date!"
				day.print_summary()
			# populate each day's just_readings array
			day.just_readings = [reading['blood_glucose'] for reading in day.readings]

		self.dates.sort()

		self.crunch_all()

	def _split(self):
		"""Split data into daily batches."""

		current_date = self.start_date

		calibs = []

		# loop through all calibrations and batch them by date
		for c in self.calibrations:
			if util_time.parse_timestamp(c['timestamp']).date() == current_date:
				calibs.append(c)
			else:
				# need to check if calibrations are empty...it happens
				if calibs != []:
					# T&E because DexcomDay object may not have been created yet for current_date
					try:
						self.days[current_date].calibrations = calibs
					except KeyError as k1:
						self.days[current_date] = DexcomDay()
						self.days[current_date].calibrations = calibs
					# reset calibs for next run of loop
					calibs = []
				# update current_date
				current_date = util_time.increment_date(current_date)
				if util_time.parse_timestamp(c['timestamp']).date() == current_date:
					calibs.append(c)

		# add final day's data
		if calibs != []:
			try:
				self.days[current_date].calibrations = calibs
			except KeyError as k2:
				self.days[current_date] = DexcomDay()
				self.days[current_date].calibrations = calibs

		# reset current_date to beginning
		current_date = self.start_date

		# store last most recent timestamp in order to check for continuity between meter readings
		last_time = util_time.parse_timestamp(self.readings[0]['timestamp'])

		dates = []

		readings = []

		# stores a *continuous* series of BG readings
		segment = []

		for r in self.readings:
			if util_time.parse_timestamp(r['timestamp']).date() == current_date:
				readings.append(r)
				# update current_time
				current_time = util_time.parse_timestamp(r['timestamp'])
				# only interested in continuity if the last_time and current_time are of the same date
				if last_time.date() == current_time.date():
					# last_time will always be less than current_time, except for first run of loop, when they will be equal
					if last_time < current_time:
						delta = current_time - last_time
						# delta of 5 doesn't work since some BG readings are 5:01 apart
						if util_time.compare_timedelta_minutes(delta, 6, '>'):
							# T&E because DexcomDay object may not have been created yet for current_date
							# in particular, if date has no calibrations, this could arise
							try:
								self.days[current_date].continuous = False
							except KeyError as k3:
								self.days[current_date] = DexcomDay()
								self.days[current_date].continuous = False
							# store and reinitalize segment when delta is greater than 6
							self.days[current_date].continuous_segments.append(segment)
							segment = [r]
						# if delta falls within acceptable range for continuity, just add reading to segment
						else:
							segment.append(r)
					# only triggered during first run of loop
					elif last_time == current_time:
						segment.append(r)
				# triggered at the beginning of each new day
				else:
					segment.append(r)
				# update last_time
				last_time = current_time
			else:
				# readings could be empty if no data for a particular day
				if readings != []:
					# T&E because DexcomDay object may not have been created yet for current_date
					# in particular, if date has no calibrations, this could arise
					try:
						self.days[current_date].readings = readings
					except KeyError as k4:
						self.days[current_date] = DexcomDay()
						self.days[current_date].readings = readings
					if not self.days[current_date].continuous:
						self.days[current_date].continuous_segments.append(segment)
					else:
						self.days[current_date].continuous_segments.append(readings)
					# reset readings and segment for next run of loop
					readings = []
					segment = []
				dates.append(current_date)
				# udpate current_date
				current_date = util_time.increment_date(current_date)
				if util_time.parse_timestamp(r['timestamp']).date() == current_date:
					readings.append(r)

		# add final day's data
		dates.append(current_date)
		if readings != []:
			try:
				self.days[current_date].readings = readings
			except KeyError as k5:
				self.days[current_date] = DexcomDay()
				self.days[current_date].readings = readings
			if not self.days[current_date].continuous:
				self.days[current_date].continuous_segments.append(segment)
			else:
				self.days[current_date].continuous_segments.append(readings)

		# must remain here because of chicken/egg problem with calling DexcomDay._times()
		for date in dates:
			try:
				d = self.days[date]
				d._times()
			except KeyError as k6:
				pass

	def crunch_all(self):
		"""Call all statistic-calculating methods for each day with data."""

		for date in self.dates:
			d = self.days[date]
			d.calculate_GVI_and_PGS()

	def print_summaries(self):
		"""Call DexcomDay.print_summary() method for each day with data."""

		for date in self.dates:
			d = self.days[date]
			d.print_summary()

class GVI():
	"""Glycemic Variability Index."""
	"""As described here: http://www.diabetesmine.com/2012/11/a-new-view-of-glycemic-variability-how-long-is-your-line.html"""

	def __init__(self, segments):

		# an array of continuous segments of blood glucose values
		self.segments = segments

		# total number of blood glucose values in the arbitrary time period represented by all segments in self.segments
		self.total = float(sum(len(segment) for segment in self.segments))

	def calculate_weighted_GVI(self):
		"""Calculate the weighted GVI for an arbitrary time unit represented by an array of segments."""

		segment_GVIs = []
		weighted_gvi = 0

		# get GVI for each continuous segment
		for segment in self.segments:
			if len(segment) > 1:
				gvi = GVISegment(segment)
				segment_GVIs.append((len(segment), gvi.get_GVI()))

		# calculate weighted average of segment GVIs; weighted by length of segment
		for segment_GVI in segment_GVIs:
			weighted_gvi += (segment_GVI[0] / self.total) * segment_GVI[1]

		return weighted_gvi

class GVISegment():
	"""A continuous segment of blood glucose values, where continuous <= 6 minutes apart."""
	"""A continuous segment is the minimal unit over which a GVI can be calculated."""

	def __init__(self, segment):

		# a series of continuous (<= 6 minutes apart) blood glucose readings
		self.segment = segment

		# total change in time (of a continuous segment of BG readings) = 5 * (n - 1) where n is the number of BG readings
		self.dx = (len(self.segment) - 1) * 5

		# final blood glucose reading - initial blood glucose reading of a continuous segment of BG readings
		self.dy = int(segment[-1]['blood_glucose']) - int(segment[0]['blood_glucose'])

		# actual length of path
		self.dl_1 = self._dl_1()

		# ideal length of path
		self.dl_0 = math.sqrt(math.pow(self.dx, 2) + math.pow(self.dy, 2))

	def _dl_1(self):
		"""Calculate and return actual dl."""

		dl = 0
		for i, reading in enumerate(self.segment):
			if i == 0:
				pass
			else:
				delta = int(reading['blood_glucose']) - int(self.segment[i - 1]['blood_glucose'])
				# 25 because 5^2 (5 because BG readings assumed 5 minutes apart)
				dl += math.sqrt(25 + math.pow(delta, 2))

		return dl

	def get_GVI(self):
		"""Return GVI."""

		return self.dl_1 / self.dl_0

class PGS():
	"""Patient Glycemic Status."""
	"""As described here: http://www.diabetesmine.com/2012/11/a-new-view-of-glycemic-variability-how-long-is-your-line.html"""

	def __init__(self, readings, target_range, gvi):

		self.readings = readings

		# tuple (min, max) target blood glucose range for calculating percentage of time in range (PTIR)
		self.target_range = target_range

		self.mean_glucose = numpy.mean(readings)

		# Glycemic Variability Index
		self.gvi = gvi

		# Percentage of Time in Range
		self.ptir = self.get_PTIR()

	def get_PTIR(self):
		"""Return percentage of time in range given tuple range."""

		target_min = self.target_range[0]

		target_max = self.target_range[1]

		total = float(len(self.readings))

		in_range = 0

		for reading in self.readings:
			if reading >= target_min and reading <= target_max:
				in_range += 1
		return in_range / total

	def get_PGS(self):
		"""Return PGS."""

		return self.gvi * self.mean_glucose * (1 - self.ptir)

class DexcomDay():
	"""A single day of Dexcom data."""

	def __init__(self):

		self.calibrations = []

		self.readings = []

		self.start_time, self.date = "", ""

		self.end_time = ""

		self.continuous = True

		self.continuous_segments = []

		# an array of just blood glucose values
		self.just_readings = []

		# Glycemic Variability Index
		self.gvi = 0

		# Patient Glycemic Status
		self.pgs = 0

	def _times(self):
		"""Fill in start and end times and dates."""

		# just in case a calibration timestamp happens to occur before or after the first or last CGM reading of the day
		if len(self.calibrations) != 0 and len(self.readings) != 0:
			self.start_time, self.date = util_time.get_start_time(self.calibrations[0]['timestamp'], 
				self.readings[0]['timestamp'])
			self.end_time = util_time.get_end_time(self.calibrations[-1]['timestamp'], 
				self.readings[-1]['timestamp'])
		elif len(self.readings) != 0:
			self.start_time = util_time.parse_timestamp(self.readings[0]['timestamp'])
			self.date = self.start_time.date()
			self.end_time = util_time.parse_timestamp(self.readings[-1]['timestamp'])
		else:
			self.start_time = util_time.parse_timestamp(self.calibrations[0]['timestamp'])
			self.date = self.start_time.date()
			print str(self.date) + " has (a) calibration(s) but no CGM readings."
			print
			self.end_time = util_time.parse_timestamp(self.calibrations[0]['timestamp'])

	def calculate_GVI_and_PGS(self):
		"""Calculate the glycemic variability index (GVI) for the given day."""

		gvi = GVI(self.continuous_segments)

		self.gvi = gvi.calculate_weighted_GVI()

		if len(self.just_readings) != 0:
			# TODO: don't hardcode the target range values!
			self.pgs = PGS(self.just_readings, (65, 140), self.gvi).get_PGS()

	def print_summary(self):
		"""Print a summary of the data stored for this day."""

		print self.date
		print "No. of calibrations = " + str(len(self.calibrations))
		print "No. of readings = " + str(len(self.readings))
		print "Continuous: " + str(self.continuous)
		print "No. of continuous segments = " + str(len(self.continuous_segments))
		print "Weighted average of Glycemic Variability Index: " + "%0.2f" %self.gvi
		print "Patient Glycemic Status: " + "%0.1f" %self.pgs
		print

def main():

    parser = argparse.ArgumentParser(description='Process the input Dexcom JSON file.')
    parser.add_argument('-d', '--dexcom', action = 'store', dest = "dex_name", help='name of Dexcom .json file')

    args = parser.parse_args()

    d = DexcomStats(args.dex_name)
    d.print_summaries()

if __name__ == '__main__':
	main()