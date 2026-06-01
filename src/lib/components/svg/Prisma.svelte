				<svg
						class="w-4/5 h-4/5 text-brand drop-shadow-[0_10px_30px_rgba(5,150,105,0.15)]"
						viewBox="0 0 400 400"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<!-- Hexagonal central grid overlay -->
						<path d="M200 40 L340 120 L340 280 L200 360 L60 280 L60 120 Z" stroke="currentColor" stroke-width="1.5" stroke-dasharray="8 8" class="opacity-25" />
						<path d="M200 100 L280 150 L280 250 L200 300 L120 250 L120 150 Z" stroke="currentColor" stroke-width="1" stroke-dasharray="6 6" class="opacity-30" />

						<!-- Connecting Bonds (molecular lines) -->
						<line x1="200" y1="40" x2="200" y2="100" stroke="currentColor" stroke-width="3" class="animate-pulse" />
						<line x1="340" y1="120" x2="280" y2="150" stroke="currentColor" stroke-width="3" />
						<line x1="340" y1="280" x2="280" y2="250" stroke="currentColor" stroke-width="3" />
						<line x1="200" y1="360" x2="200" y2="300" stroke="currentColor" stroke-width="3" />
						<line x1="60" y1="280" x2="120" y2="250" stroke="currentColor" stroke-width="3" />
						<line x1="60" y1="120" x2="120" y2="150" stroke="currentColor" stroke-width="3" />

						<!-- Inner molecular chain -->
						<line x1="200" y1="100" x2="280" y2="150" stroke="currentColor" stroke-width="2.5" />
						<line x1="280" y1="150" x2="280" y2="250" stroke="currentColor" stroke-width="2.5" />
						<line x1="280" y1="250" x2="200" y2="300" stroke="currentColor" stroke-width="2.5" />
						<line x1="200" y1="300" x2="120" y2="250" stroke="currentColor" stroke-width="2.5" />
						<line x1="120" y1="250" x2="120" y2="150" stroke="currentColor" stroke-width="2.5" />
						<line x1="120" y1="150" x2="200" y2="100" stroke="currentColor" stroke-width="2.5" />

						<!-- Double bond representing chemical structure -->
						<line x1="135" y1="160" x2="195" y2="115" stroke="currentColor" stroke-width="1.5" class="opacity-60" />
						<line x1="265" y1="240" x2="205" y2="290" stroke="currentColor" stroke-width="1.5" class="opacity-60" />

						<!-- Molecular atoms (rendered as gorgeous layered circles) -->
						<!-- Atom Carbon (Top) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[200px_40px]">
							<circle cx="200" cy="40" r="16" fill="var(--color-brand)" class="opacity-20" />
							<circle cx="200" cy="40" r="10" fill="var(--color-brand)" />
							<circle cx="200" cy="40" r="4" fill="#ffffff" />
						</g>

						<!-- Atom Nitrogen (Right) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[340px_120px]">
							<circle cx="340" cy="120" r="18" fill="var(--color-brand-bright)" class="opacity-20" />
							<circle cx="340" cy="120" r="11" fill="var(--color-brand-bright)" />
							<circle cx="340" cy="120" r="5" fill="#ffffff" />
						</g>

						<!-- Atom Oxygen (Bottom-Right) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[340px_280px]">
							<circle cx="340" cy="280" r="16" fill="var(--color-brand)" class="opacity-20" />
							<circle cx="340" cy="280" r="9" fill="var(--color-brand)" />
							<circle cx="340" cy="280" r="3" fill="#ffffff" />
						</g>

						<!-- Atom Hydrogen (Bottom) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[200px_360px]">
							<circle cx="200" cy="360" r="20" fill="var(--color-brand-bright)" class="opacity-20" />
							<circle cx="200" cy="360" r="12" fill="var(--color-brand-bright)" />
							<circle cx="200" cy="360" r="6" fill="#ffffff" />
						</g>

						<!-- Atom carbon (Left-Bottom) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[60px_280px]">
							<circle cx="60" cy="280" r="16" fill="var(--color-brand)" class="opacity-20" />
							<circle cx="60" cy="280" r="10" fill="var(--color-brand)" />
							<circle cx="60" cy="280" r="4" fill="#ffffff" />
						</g>

						<!-- Atom Sulfur (Left-Top) -->
						<g class="transition-transform duration-500 hover:scale-110 origin-[60px_120px]">
							<circle cx="60" cy="120" r="18" fill="var(--color-brand-bright)" class="opacity-20" />
							<circle cx="60" cy="120" r="11" fill="var(--color-brand-bright)" />
							<circle cx="60" cy="120" r="5" fill="#ffffff" />
						</g>

						<!-- Inner Atoms (small nodes) -->
						<circle cx="200" cy="100" r="4" fill="currentColor" />
						<circle cx="280" cy="150" r="4" fill="currentColor" />
						<circle cx="280" cy="250" r="4" fill="currentColor" />
						<circle cx="200" cy="300" r="4" fill="currentColor" />
						<circle cx="120" cy="250" r="4" fill="currentColor" />
						<circle cx="120" cy="150" r="4" fill="currentColor" />

						<!-- Decorative orbit path representation -->
						<ellipse cx="200" cy="200" rx="150" ry="60" stroke="currentColor" stroke-width="0.75" class="opacity-20" transform="rotate(-30 200 200)" />
						<ellipse cx="200" cy="200" rx="150" ry="60" stroke="currentColor" stroke-width="0.75" class="opacity-20" transform="rotate(30 200 200)" />
					</svg>