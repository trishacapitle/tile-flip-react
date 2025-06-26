import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ROWS = 6;
const COLS = 6;
const COOLDOWN = 1000;

export default function App() {
	const [isFlipped, setIsFlipped] = useState(false);
	const isFlippedRef = useRef(isFlipped);
	const container = useRef(null);

	// keep the ref in sync with React state
	useEffect(() => {
		isFlippedRef.current = isFlipped;
	}, [isFlipped]);

	useGSAP(
		() => {
			const tiles = Array.from(container.current.querySelectorAll(".tile"));
			const flipButton = container.current.querySelector("#flipButton");

			tiles.forEach((tile, index) => {
				let lastEnter = 0;
				const onEnter = () => {
					const now = Date.now();
					if (now - lastEnter < COOLDOWN) return;
					lastEnter = now;

					const colId = index % COLS;
					const tiltMap = { 0: -40, 1: -20, 2: -10, 4: 20, 5: 40 };
					const tiltY = tiltMap[colId] ?? 10;

					// read the *current* flipped state from the ref
					const flipped = isFlippedRef.current;

					gsap
						.timeline()
						.set(tile, { rotateX: flipped ? 180 : 0, rotateY: 0 })
						.to(tile, {
							rotateX: flipped ? 450 : 270,
							rotateY: tiltY,
							duration: 0.5,
							ease: "power2.out",
						})
						.to(
							tile,
							{
								rotateX: flipped ? 540 : 360,
								rotateY: 0,
								duration: 0.5,
								ease: "power2.out",
							},
							"-=0.25"
						);
				};

				tile.addEventListener("mouseenter", onEnter);

				// cleanup
				return () => tile.removeEventListener("mouseenter", onEnter);
			});

			const onFlipAll = () => {
				const newFlipped = !isFlippedRef.current;
				setIsFlipped(newFlipped);
				// also update the ref immediately so any hovers mid‐animation read the new value
				isFlippedRef.current = newFlipped;

				gsap.to(tiles, {
					rotateX: newFlipped ? 180 : 0,
					duration: 1,
					stagger: { amount: 0.5, from: "random" },
					ease: "power2.inOut",
				});
			};

			flipButton?.addEventListener("click", onFlipAll);
			return () => flipButton?.removeEventListener("click", onFlipAll);
		},
		{ scope: container }
	);

	return (
		<div ref={container}>
			<nav>
				<a href="#">
					Ash<span>Dev</span>
				</a>
				<button id="flipButton">Flip Tiles</button>
			</nav>

			<section className="board">
				{Array.from({ length: ROWS }).map((_, rowId) => (
					<div className="row" key={rowId}>
						{Array.from({ length: COLS }).map((_, colId) => {
							const bgPos = `${colId * 20}% ${rowId * 20}%`;
							return (
								<div key={colId} className="tile">
									<div
										className="tile-face tile-front"
										style={{ backgroundPosition: bgPos }}
									/>
									<div
										className="tile-face tile-back"
										style={{ backgroundPosition: bgPos }}
									/>
								</div>
							);
						})}
					</div>
				))}
			</section>
		</div>
	);
}
