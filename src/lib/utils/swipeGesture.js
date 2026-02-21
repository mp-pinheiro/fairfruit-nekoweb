export function createSwipeGesture({
	threshold = 80,
	velocityThreshold = 0.3,
	onSwipeStart = () => {},
	onSwipeMove = () => {},
	onSwipeEnd = () => {}
} = {}) {
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let isDragging = false;

	function start(clientX, clientY) {
		startX = clientX;
		startY = clientY;
		startTime = Date.now();
		isDragging = true;
		onSwipeStart();
	}

	function move(clientX, clientY) {
		if (!isDragging) return { deltaX: 0, deltaY: 0 };

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;

		onSwipeMove(deltaX, deltaY);

		return { deltaX, deltaY };
	}

	function end(clientX, clientY) {
		if (!isDragging) return null;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;
		const endTime = Date.now();
		const duration = endTime - startTime;
		const velocity = Math.abs(deltaX) / (duration || 1);

		isDragging = false;

		const meetsThreshold = Math.abs(deltaX) >= threshold || velocity >= velocityThreshold;

		let direction = null;
		if (meetsThreshold) {
			direction = deltaX < 0 ? 'left' : 'right';
		}

		const result = {
			direction,
			deltaX,
			deltaY,
			velocity,
			meetsThreshold
		};

		onSwipeEnd(result);

		return result;
	}

	function cancel() {
		isDragging = false;
	}

	return {
		start,
		move,
		end,
		cancel,
		get isDragging() { return isDragging; }
	};
}

export function attachSwipeGesture(element, options) {
	const gesture = createSwipeGesture(options);

	const handleTouchStart = (e) => {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			gesture.start(touch.clientX, touch.clientY);
		}
	};

	const handleTouchMove = (e) => {
		if (gesture.isDragging && e.touches.length === 1) {
			const touch = e.touches[0];
			const { deltaX, deltaY } = gesture.move(touch.clientX, touch.clientY);

			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				e.preventDefault();
			}
		}
	};

	const handleTouchEnd = (e) => {
		if (gesture.isDragging) {
			const touch = e.changedTouches[0];
			gesture.end(touch.clientX, touch.clientY);
		}
	};

	const handleMouseDown = (e) => {
		gesture.start(e.clientX, e.clientY);
	};

	const handleMouseMove = (e) => {
		if (gesture.isDragging) {
			gesture.move(e.clientX, e.clientY);
		}
	};

	const handleMouseUp = (e) => {
		if (gesture.isDragging) {
			gesture.end(e.clientX, e.clientY);
		}
	};

	element.addEventListener('touchstart', handleTouchStart, { passive: false });
	element.addEventListener('touchmove', handleTouchMove, { passive: false });
	element.addEventListener('touchend', handleTouchEnd);
	element.addEventListener('mousedown', handleMouseDown);
	element.addEventListener('mousemove', handleMouseMove);
	element.addEventListener('mouseup', handleMouseUp);

	return () => {
		element.removeEventListener('touchstart', handleTouchStart);
		element.removeEventListener('touchmove', handleTouchMove);
		element.removeEventListener('touchend', handleTouchEnd);
		element.removeEventListener('mousedown', handleMouseDown);
		element.removeEventListener('mousemove', handleMouseMove);
		element.removeEventListener('mouseup', handleMouseUp);
	};
}
