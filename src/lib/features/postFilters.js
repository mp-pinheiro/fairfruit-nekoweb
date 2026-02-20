export function parseDateISO(isoString) {
	if (!isoString || isoString.length !== 10) return null;
	const parts = isoString.split('-');
	if (parts.length !== 3) return null;
	const [yearStr, monthStr, dayStr] = parts;
	if (yearStr.length !== 4 || monthStr.length !== 2 || dayStr.length !== 2) return null;

	const year = parseInt(yearStr, 10);
	const month = parseInt(monthStr, 10);
	const day = parseInt(dayStr, 10);

	if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
	if (day < 1 || day > 31) return null;
	if (month < 1 || month > 12) return null;
	if (year < 1900 || year > 9999) return null;

	const date = new Date(year, month - 1, day);
	if (date.getDate() !== day) return null;
	return date;
}

export function formatDisplayDate(isoString) {
	if (!isoString) return '';
	const date = parseDateISO(isoString);
	if (!date) return isoString;
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export function convertToISO(dmyString) {
	if (!dmyString || dmyString.length !== 10) return '';
	const parts = dmyString.split('/');
	if (parts.length !== 3) return '';
	const [dayStr, monthStr, yearStr] = parts;
	return `${yearStr}-${monthStr}-${dayStr}`;
}

export function handleDateInput(event, field, tempFilters) {
	let input = event.target;
	let value = input.value.replace(/\D/g, '');

	if (value.length > 8) {
		value = value.slice(0, 8);
	}

	if (value.length >= 2) {
		const day = parseInt(value.slice(0, 2), 10);
		if (day > 31) value = '31' + value.slice(2);
	}
	if (value.length >= 4) {
		const month = parseInt(value.slice(2, 4), 10);
		if (month > 12) value = value.slice(0, 2) + '12' + value.slice(4);
	}
	if (value.length >= 6) {
		const year = parseInt(value.slice(4, 8), 10);
		if (year > 9999) value = value.slice(0, 4) + '9999';
	}

	let formatted = '';
	if (value.length > 0) {
		formatted = value.slice(0, 2);
		if (value.length >= 4) {
			formatted += '/' + value.slice(2, 4);
		}
		if (value.length >= 6) {
			formatted += '/' + value.slice(4, 8);
		}
	}

	tempFilters[field] = formatted;
	input.value = formatted;
}
