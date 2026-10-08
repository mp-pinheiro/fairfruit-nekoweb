import { describe, expect, test } from 'bun:test';
import { fetchPaginatedPosts } from './bsky.js';

function item(index, date = new Date(Date.UTC(2024, 1, 20) - index * 86400000).toISOString()) {
	return { post: { uri: `at://did:plc:test/app.bsky.feed.post/${index}`, cid: `cid-${index}`, record: { text: `post ${index}`, createdAt: date } } };
}

function response(feed, cursor) {
	return { ok: true, json: async () => ({ feed, cursor }) };
}

function deferred() {
	let resolve;
	const promise = new Promise(done => { resolve = done; });
	return { promise, resolve };
}

const filters = { fromDate: '', toDate: '', sortOrder: 'latest' };

describe('fetchPaginatedPosts archive', () => {
	test('renders a usable latest page before the archive finishes, then supplies exact totals', async () => {
		const later = deferred();
		const ready = deferred();
		const fetchFn = async url => new URL(url).searchParams.has('cursor')
			? later.promise
			: response(Array.from({ length: 5 }, (_, index) => item(index)), 'next');
		let finished = false;
		const loading = fetchPaginatedPosts('progressive.test', filters, 0, fetchFn, {
			onProgress: result => { if (result.ready) ready.resolve(result); }
		}).then(result => { finished = true; return result; });
		const first = await ready.promise;
		expect(first.complete).toBe(false);
		expect(first.posts.map(post => post.post.cid)).toEqual(['cid-0', 'cid-1', 'cid-2', 'cid-3', 'cid-4']);
		expect(finished).toBe(false);
		later.resolve(response([item(5), item(6)], null));
		const final = await loading;
		expect(final.complete).toBe(true);
		expect(final.totalCount).toBe(7);
		const next = await fetchPaginatedPosts('progressive.test', filters, 1, () => { throw new Error('archive fetched again'); });
		expect(next.posts.map(post => post.post.cid)).toEqual(['cid-5', 'cid-6']);
		expect(next.totalCount).toBe(7);
	});

	test('shares an actor archive across concurrent and subsequent filter changes', async () => {
		let calls = 0;
		const firstBatch = deferred();
		const fetchFn = async () => { calls++; return firstBatch.promise; };
		const dates = { fromDate: '2024-02-19', toDate: '2024-02-20', sortOrder: 'latest' };
		const first = fetchPaginatedPosts('shared.test', dates, 0, fetchFn);
		const unfiltered = fetchPaginatedPosts('shared.test', filters, 0, fetchFn);
		firstBatch.resolve(response([item(0), item(1), item(2)], null));
		const results = await Promise.all([first, unfiltered]);
		expect(results.map(result => result.totalCount)).toEqual([2, 3]);
		const ascending = await fetchPaginatedPosts('shared.test', { ...filters, sortOrder: 'top' }, 0, fetchFn);
		expect(ascending.posts.map(post => post.post.cid)).toEqual(['cid-2', 'cid-1', 'cid-0']);
		expect(calls).toBe(1);
	});

	test('keeps different actors isolated', async () => {
		const fetchFn = async url => response([item(new URL(url).searchParams.get('actor') === 'actor-a.test' ? 1 : 2)], null);
		const first = await fetchPaginatedPosts('actor-a.test', filters, 0, fetchFn);
		const other = await fetchPaginatedPosts('actor-b.test', filters, 0, fetchFn);
		expect(first.posts[0].post.cid).toBe('cid-1');
		expect(other.posts[0].post.cid).toBe('cid-2');
	});

	test('includes the whole local end date and excludes dates outside the bounds', async () => {
		const date = (day, hours, minutes, seconds, milliseconds) => new Date(2024, 1, day, hours, minutes, seconds, milliseconds).toISOString();
		const feed = [item(0, date(1, 0, 0, 0, 0)), item(1, date(2, 23, 59, 59, 999)), item(2, date(3, 0, 0, 0, 0)), item(3, date(0, 23, 59, 59, 999))];
		const result = await fetchPaginatedPosts('dates.test', { fromDate: '2024-02-01', toDate: '2024-02-02', sortOrder: 'latest' }, 0, async () => response(feed, null));
		expect(result.posts.map(post => post.post.cid)).toEqual(['cid-1', 'cid-0']);
		expect(result.totalCount).toBe(2);
	});

	test('resolves a query post ID independently of the sidebar page', async () => {
		const fetchFn = async () => response(Array.from({ length: 12 }, (_, index) => item(index)), null);
		const result = await fetchPaginatedPosts('selection.test', filters, 0, fetchFn, { postId: '7' });
		expect(result.selectedPost.post.cid).toBe('cid-7');
		expect(result.currentPage).toBe(0);
		expect(result.postPage).toBe(1);
		expect(result.posts.map(post => post.post.cid)).toEqual(['cid-0', 'cid-1', 'cid-2', 'cid-3', 'cid-4']);
		const missing = await fetchPaginatedPosts('selection.test', filters, 0, fetchFn, { postId: 'missing' });
		expect(missing.selectedPost).toBeNull();
		expect(missing.complete).toBe(true);
	});

	test('propagates a later archive failure and fetches a clean archive on recovery', async () => {
		const later = deferred();
		const ready = deferred();
		const loading = fetchPaginatedPosts('recover.test', filters, 0, async url => new URL(url).searchParams.has('cursor')
			? later.promise
			: response(Array.from({ length: 5 }, (_, index) => item(index)), 'next'), {
			onProgress: result => { if (result.ready) ready.resolve(result); }
		});
		await ready.promise;
		later.resolve({ ok: false, status: 503, statusText: 'Unavailable' });
		await expect(loading).rejects.toThrow('503 Unavailable');
		const recovered = await fetchPaginatedPosts('recover.test', filters, 0, async () => response([item(8)], null));
		expect(recovered.posts.map(post => post.post.cid)).toEqual(['cid-8']);
		expect(recovered.totalCount).toBe(1);
	});

	test('waits for the complete archive before presenting Top in ascending chronology', async () => {
		const later = deferred();
		const partial = deferred();
		const loading = fetchPaginatedPosts('top.test', { ...filters, sortOrder: 'top' }, 0, async url => new URL(url).searchParams.has('cursor')
			? later.promise
			: response(Array.from({ length: 5 }, (_, index) => item(index)), 'next'), {
			onProgress: result => { if (result.totalCount === 5) partial.resolve(result); }
		});
		expect((await partial.promise).ready).toBe(false);
		later.resolve(response([item(5), item(6)], null));
		const result = await loading;
		expect(result.complete).toBe(true);
		expect(result.posts.map(post => post.post.cid)).toEqual(['cid-6', 'cid-5', 'cid-4', 'cid-3', 'cid-2']);
	});

	test('retains the 750-entry archive boundary and excludes reposts', async () => {
		const fetchFn = async url => {
			const params = new URL(url).searchParams;
			const offset = Number(params.get('cursor') || 0);
			const end = Math.min(1000, offset + Number(params.get('limit')));
			return response(Array.from({ length: end - offset }, (_, index) => {
				const entry = item(offset + index);
				if ((offset + index) % 10 === 0) entry.reason = { $type: 'app.bsky.feed.defs#reasonRepost' };
				return entry;
			}), end < 1000 ? String(end) : null);
		};
		const result = await fetchPaginatedPosts('boundary.test', { ...filters, sortOrder: 'top' }, 0, fetchFn);
		expect(result.totalCount).toBe(675);
		expect(result.posts[0].post.cid).toBe('cid-749');
		expect(result.posts.every(post => !post.reason)).toBe(true);
	});
});
