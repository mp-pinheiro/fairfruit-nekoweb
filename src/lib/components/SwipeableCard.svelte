<script>
	import { onMount, onDestroy } from 'svelte';
	import { attachSwipeGesture } from '$lib/utils/swipeGesture.js';
	import gsap from 'gsap';

	let { children, onSwipeNext = () => {}, onSwipePrev = () => {}, disabled = false, entryDirection = 'left' } = $props();

	let cardElement;
	let cleanupGesture;
	let isAnimating = false;

	onMount(() => {
		if (disabled) {
			gsap.to(cardElement, {
				opacity: 1,
				duration: 0.2,
				ease: 'power1.out'
			});
			return;
		}

		const startX = entryDirection === 'left' ? window.innerWidth : -window.innerWidth;
		const startRotation = entryDirection === 'left' ? 15 : -15;

		gsap.fromTo(
			cardElement,
			{
				x: startX,
				rotation: startRotation,
				opacity: 0,
				scale: 0.9
			},
			{
				x: 0,
				rotation: 0,
				opacity: 1,
				scale: 1,
				duration: 0.4,
				ease: 'power2.out'
			}
		);

		cleanupGesture = attachSwipeGesture(cardElement, {
			threshold: 80,
			velocityThreshold: 0.3,
			onSwipeStart: () => {
				if (isAnimating) return;
				gsap.killTweensOf(cardElement);
			},
			onSwipeMove: (deltaX, deltaY) => {
				if (isAnimating) return;

				const rotation = deltaX * 0.05;
				const scale = 1 - Math.abs(deltaX) * 0.0005;
				const opacity = 1 - Math.abs(deltaX) * 0.002;
				const shadowIntensity = Math.abs(deltaX) * 0.01;

				gsap.set(cardElement, {
					x: deltaX,
					rotation,
					scale,
					opacity,
					boxShadow: shadowIntensity > 0
						? `${shadowIntensity}px ${shadowIntensity * 2}px ${shadowIntensity * 4}px rgba(0,0,0,0.2)`
						: ''
				});
			},
			onSwipeEnd: (result) => {
				if (isAnimating) return;

				if (result.meetsThreshold && result.direction) {
					handleNavigateAway(result.direction);
				} else {
					handleSnapBack();
				}
			}
		});
	});

	onDestroy(() => {
		if (cleanupGesture) cleanupGesture();
		gsap.killTweensOf(cardElement);
	});

	function handleSnapBack() {
		isAnimating = true;
		gsap.to(cardElement, {
			x: 0,
			rotation: 0,
			scale: 1,
			opacity: 1,
			boxShadow: '',
			duration: 0.3,
			ease: 'back.out(1.7)',
			onComplete: () => {
				isAnimating = false;
			}
		});
	}

	function handleNavigateAway(direction) {
		isAnimating = true;

		const exitX = direction === 'left' ? -window.innerWidth : window.innerWidth;
		const exitRotation = direction === 'left' ? -15 : 15;

		gsap.to(cardElement, {
			x: exitX,
			rotation: exitRotation,
			opacity: 0,
			scale: 0.9,
			duration: 0.35,
			ease: 'power2.in',
			onComplete: () => {
				if (direction === 'left') {
					onSwipeNext();
				} else {
					onSwipePrev();
				}
			}
		});
	}

	export function shake() {
		if (isAnimating) return;
		isAnimating = true;

		gsap.to(cardElement, {
			x: '+=10',
			duration: 0.05,
			repeat: 5,
			yoyo: true,
			ease: 'power1.inOut',
			onComplete: () => {
				gsap.to(cardElement, {
					x: 0,
					duration: 0.1,
					ease: 'power1.out',
					onComplete: () => {
						isAnimating = false;
					}
				});
			}
		});
	}
</script>

<div
	bind:this={cardElement}
	class="swipeable-card"
	class:disabled
>
	{@render children()}
</div>

<style>
	.swipeable-card {
		will-change: transform, opacity;
		touch-action: pan-y;
		user-select: none;
		opacity: 0;
	}

	.swipeable-card.disabled {
		touch-action: auto;
	}
</style>
