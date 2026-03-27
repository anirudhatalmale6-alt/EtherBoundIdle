/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        orbitron: ['var(--font-orbitron)'],
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'rarity-common', 'rarity-uncommon', 'rarity-rare', 'rarity-epic', 'rarity-legendary',
    'glow-cyan', 'glow-purple', 'glow-gold',
    'text-green-400', 'text-blue-400', 'text-purple-400', 'text-yellow-400', 'text-gray-400',
    'bg-green-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-yellow-500/20', 'bg-gray-500/20',
    'border-green-500/30', 'border-blue-500/30', 'border-purple-500/30', 'border-yellow-500/30', 'border-gray-500/30',
    'from-green-500/10', 'from-blue-500/10', 'from-purple-500/10', 'from-yellow-500/10',
    'text-red-400', 'text-cyan-400', 'text-orange-400', 'text-emerald-400',
    'bg-red-500/20', 'bg-cyan-500/20', 'bg-orange-500/20', 'bg-emerald-500/20',
    'border-red-500/30', 'border-cyan-500/30', 'border-orange-500/30', 'border-emerald-500/30',
    'border-red-500/30', 'bg-red-500/20', 'text-red-400',
    'text-orange-400', 'bg-orange-500/20', 'border-orange-500/30',
    'text-yellow-300', 'bg-yellow-400/20', 'border-yellow-400/40',
    'ring-yellow-400/50', 'ring-1',
    'ring-yellow-400/40',
    'border-emerald-500/60', 'border-green-500/60', 'border-lime-500/60',
    'border-orange-500/60', 'border-yellow-500/60', 'border-amber-500/60',
    'border-cyan-500/60', 'border-blue-400/60', 'border-sky-500/60',
    'border-purple-500/60', 'border-slate-400/60', 'border-violet-500/60',
    'border-yellow-400/70', 'border-amber-400/70', 'border-blue-300/70',
    'border-green-400/70', 'border-rose-500/70',
    'text-cyan-300', 'text-cyan-400', 'bg-cyan-500/20', 'border-cyan-500/30', 'border-cyan-400/60', 'ring-cyan-400/50',
    'text-emerald-400', 'text-lime-400', 'text-amber-400', 'text-sky-400',
    'text-violet-400', 'text-slate-400', 'text-blue-300', 'text-green-300',
    'text-amber-300', 'text-yellow-300', 'text-rose-400', 'text-blue-200',
    'shadow-emerald-500/40', 'shadow-green-500/40', 'shadow-yellow-500/40',
    'shadow-orange-500/40', 'shadow-cyan-500/40', 'shadow-blue-400/40',
    'shadow-purple-500/40', 'shadow-amber-400/50', 'shadow-yellow-400/50',
    'shadow-blue-300/50', 'shadow-green-400/50', 'shadow-rose-500/50',
    'bg-yellow-500/10', 'bg-yellow-500/15', 'bg-yellow-500/20',
    'text-sky-400', 'text-emerald-400', 'text-violet-400', 'text-lime-400', 'text-cyan-400',
    'text-rose-400', 'text-amber-400',
  ]
}