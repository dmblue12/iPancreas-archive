from datetime import datetime, timedelta, tzinfo

class DexcomInternalTime(tzinfo):

	def __init__(self, offset):
		self.offset = offset

	def utcoffset(self, dt):
		if self.offset:
			return timedelta(hours=int(self.offset))
		else:
			return None

	def dst(self, dt):
		return timedelta(hours=int(self.offset))

	def tzname(self, dt):
		return "Dexcom Internal Time"

class UserTime(tzinfo):

	def __init__(self, offset, daylight = True):
		self.offset = offset
		self.daylight = daylight

	def utcoffset(self, dt):
		return timedelta(hours=int(self.offset))

	def dst(self, dt):
		if self.daylight:
			return timedelta(hours=int(self.offset) + 1)
		else:
			return timedelta(hours=int(self.offset))

	def tzname(self, dt):
		return "User Time"

class UTC(tzinfo):

	def utcoffset(self, dt):
		return timedelta(hours=0)

	def dst(self, dt):
		return timedelta(hours=0)

	def tzname(self, dt):
		return "UTC"

def dexcom_to_ISO8601(t, offset = ""):
	"""Translates string Dexcom Studio timestamp to ISO 8601 standard format UTC."""

	if offset != "":
		dextime = DexcomInternalTime(offset)
		try:
			pt = datetime.strptime(t, '%Y-%m-%d %H:%M:%S')
		except ValueError:
			pt = datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f')
			pt = pt.replace(microsecond=0)
		pt = pt.replace(tzinfo=dextime)
		# if no offset was given for translating Dexcom-internal timestamp to UTC, return "" for the UTC_timestamp
		try:
			pt = pt.astimezone(UTC())
		except ValueError as v1:
			return ""

	else:
		try:
			pt = datetime.strptime(t, '%Y-%m-%d %H:%M:%S')
		except ValueError:
			pt = datetime.strptime(t, '%Y-%m-%d %H:%M:%S.%f')
			pt = pt.replace(microsecond=0)

	return pt.isoformat()

def parse_timestamp(timestamp):
	"""Returns the Python datetime representation of an ISO 8601 format timestamp."""

	return datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%S')

def increment_date(timestamp):
	"""Returns a datetime representation incremented by one day."""

	return timestamp + timedelta(days=1)

def compare_timedelta_minutes(d, i, comparator):
	"""Returns true if d is comparator (less than, greater than, etc.) timedelta of i minutes."""

	if comparator == '<':
		if d < timedelta(minutes=i):
			return True
		else:
			return False
	elif comparator == '>':
		if d > timedelta(minutes=i):
			return True
		else:
			return False

def get_start_time(timestamp1, timestamp2):
	"""Returns the earlier of two timestamps and the date of the earlier timestamp."""

	t1 = parse_timestamp(timestamp1)

	t2 = parse_timestamp(timestamp2)

	if t1 < t2:
		return t1, t1.date()
	else:
		return t2, t2.date()

def get_end_time(timestamp1, timestamp2):
	"""Returns the later of two timestamps and the date of the later timestamp."""

	t1 = datetime.strptime(timestamp1, '%Y-%m-%dT%H:%M:%S')

	t2 = datetime.strptime(timestamp2, '%Y-%m-%dT%H:%M:%S')

	if t1 > t2:
		return t1, t1.date()
	else:
		return t2, t2.date()