import { expect, test } from 'bun:test';
import { convertToISO, handleDateInput } from './postFilters.js';

test('keeps partial month and year digits when a date is typed', () => {
	const input = { value: '' };
	const filters = { fromDate: '' };
	const values = [];
	for (const digit of '01092026') {
		input.value += digit;
		handleDateInput({ target: input }, 'fromDate', filters);
		values.push(input.value);
	}
	expect(values[2]).toBe('01/0');
	expect(values[4]).toBe('01/09/2');
	expect(filters.fromDate).toBe('01/09/2026');
	expect(convertToISO(filters.fromDate)).toBe('2026-09-01');
});
