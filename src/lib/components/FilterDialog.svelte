<script>
	import { handleDateInput } from '$lib/features/postFilters.js';

	let {
		show = false,
		filters,
		onClose = () => {},
		onApply = () => {},
		onReset = () => {}
	} = $props();

	let tempFilters = $state({
		fromDate: '',
		toDate: '',
		sortOrder: 'newest'
	});

	$effect(() => {
		if (show) {
			tempFilters.fromDate = filters.fromDate ? filters.fromDate : '';
			tempFilters.toDate = filters.toDate ? filters.toDate : '';
			tempFilters.sortOrder = filters.sortOrder;
		}
	});

	function handleClose(e) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleApply() {
		onApply(tempFilters);
	}

	function handleReset() {
		tempFilters.fromDate = '';
		tempFilters.toDate = '';
		tempFilters.sortOrder = 'newest';
		onReset();
	}
</script>

<svelte:window onkeydown={(e) => show && e.key === 'Escape' && onClose()} />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="filter-dialog-overlay"
		onclick={handleClose}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="filter-dialog-title"
	>
		<div class="filter-dialog">
			<div class="dialog-header">
				<h3 id="filter-dialog-title">Filter Posts</h3>
				<button type="button" class="close-button" onclick={onClose} aria-label="Close dialog">×</button>
			</div>

			<div class="form-group">
				<label for="from-date">From Date</label>
				<input
					id="from-date"
					type="text"
					placeholder="dd/mm/yyyy"
					bind:value={tempFilters.fromDate}
					oninput={(e) => handleDateInput(e, 'fromDate', tempFilters)}
				/>
			</div>

			<div class="form-group">
				<label for="to-date">To Date</label>
				<input
					id="to-date"
					type="text"
					placeholder="dd/mm/yyyy"
					bind:value={tempFilters.toDate}
					oninput={(e) => handleDateInput(e, 'toDate', tempFilters)}
				/>
			</div>

			<div class="form-group">
				<label for="sort-order">Sort By</label>
				<select id="sort-order" bind:value={tempFilters.sortOrder}>
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
				</select>
			</div>

			<div class="dialog-actions">
				<button type="button" class="reset-button" onclick={handleReset}>Reset</button>
				<button type="button" class="apply-button" onclick={handleApply}>Apply</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.filter-dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-dialog {
		background: var(--color-tertiary);
		border: 2px solid var(--color-primary);
		border-radius: 15px;
		padding: 24px;
		width: 320px;
		max-width: 90vw;
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
	}

	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.dialog-header h3 {
		color: var(--color-primary);
		margin: 0;
	}

	.close-button {
		background: none;
		border: none;
		color: var(--color-quinary);
		font-size: 20px;
		cursor: pointer;
		padding: 0;
	}

	.form-group {
		margin-bottom: 16px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		font-size: 14px;
		color: var(--color-quinary);
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 8px 12px;
		border: 1px solid var(--color-primary);
		border-radius: 8px;
		background: var(--color-quaternary);
		color: var(--color-quinary);
		font-family: 'Courier New', monospace;
	}

	.form-group input::placeholder {
		color: var(--color-quinary);
		opacity: 0.5;
	}

	.dialog-actions {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		margin-top: 20px;
	}

	.reset-button,
	.apply-button {
		border-radius: 8px;
		padding: 8px 16px;
		cursor: pointer;
		font-family: 'Courier New', monospace;
		font-size: 12px;
	}

	.reset-button {
		background: none;
		border: 1px solid var(--color-quinary);
		color: var(--color-quinary);
	}

	.apply-button {
		background: var(--color-primary);
		border: none;
		color: white;
	}
</style>
