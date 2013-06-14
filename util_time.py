from datetime import datetime, timedelta

def dexcom_to_ISO8601(t):
	"""Translates string Dexcom Studio timestamp to ISO 8601 standard format UTC."""

	pt = datetime.strptime(t, '%Y-%m-%d %H:%M:%S')

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