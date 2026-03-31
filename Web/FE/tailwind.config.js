
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        luxury: {
          // PRIMARY SYSTEM - PINK & ROSE THEME
          silverPearl: '#F4E4E4',      // Main BG (Pink/Rose)
          silverPearlLight: '#FFFAFA', // Secondary BG (Ivory White)
          silverPearlDark: '#FFFAFA',  // Secondary BG (Ivory White) - Mapped for content frames

          // SECONDARY SYSTEM
          platinumGrey: '#E6D0D0',     // Borders (Soft Pink)
          platinumLight: '#F0E6DC',    // Light border
          steelGrey: '#C48A92',        // Accent (Earthy Pink)
          steelDark: '#A66D75',        // Darker accent (Deep Earthy Pink)

          // ACCENT SYSTEM
          deepBlack: '#4F3D3D',        // Primary Text (Dark Grayish Brown)
          softBlack: '#6F5D5D',        // Secondary Text (Lighter Brown)
          metallicSilver: '#D4C4BA',   // Light accent (Champagne Beige) - Keep for compatibility

          // LEGACY COMPATIBILITY (mapped to new palette)
          ivory: '#F4E4E4',            // → silverPearl
          white: '#FFFAFA',            // → silverPearlLight
          mint: '#FFFAFA',             // → silverPearlDark
          sage: '#C48A92',             // → steelGrey
          softGreen: '#F0E6DC',        // → platinumLight
          beige: '#E6D0D0',            // → platinumGrey
          taupe: '#C48A92',            // → steelGrey
          brown: '#A66D75',            // → steelDark
          charcoal: '#6F5D5D',         // → softBlack
          black: '#4F3D3D',            // → deepBlack
        },

        accent: {
          // LUXURY ACCENTS (Pink & Rose Edition)
          silver: '#D4C4BA',           // Champagne Beige
          silverDark: '#E6D0D0',       // Soft Pink Border
          platinum: '#C48A92',         // Earthy Pink

          // FUNCTIONAL COLORS
          primary: '#4F3D3D',          // Primary action (Dark Brown)
          secondary: '#C48A92',        // Secondary action (Earthy Pink)
          success: '#7FA87F',          // Success (Sage Green)
          warning: '#E8A87C',          // Warning (Peach)
          error: '#C85A6E',            // Error (Rose Red)

          // LEGACY COMPATIBILITY
          gold: '#C48A92',             // Gold → Earthy Pink
          rose: '#F4E4E4',             // Rose → Main Pink BG
          peach: '#FFFAFA',            // Peach → Ivory White
          mintLight: '#FFFAFA',        // Mint → Ivory White
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'], // Restore Cormorant Garamond for specific serif usage (Header)
        display: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        'extra-wide': '0.15em',
        'wide': '0.05em',
      },
      borderWidth: {
        '1': '1px',
      },
      boxShadow: {
        // LUXURY SILVER SHADOW SYSTEM
        'silver-sm': '0 1px 2px rgba(26, 26, 26, 0.04)',
        'silver-md': '0 4px 6px rgba(26, 26, 26, 0.08)',
        'silver-lg': '0 10px 15px rgba(26, 26, 26, 0.12)',
        'silver-xl': '0 20px 25px rgba(26, 26, 26, 0.16)',
        'silver-2xl': '0 25px 50px rgba(26, 26, 26, 0.20)',

        // LEGACY COMPATIBILITY
        'sm': '0 1px 2px rgba(26, 26, 26, 0.04)',
        'md': '0 4px 6px rgba(26, 26, 26, 0.08)',
        'lg': '0 10px 15px rgba(26, 26, 26, 0.12)',
        'xl': '0 20px 25px rgba(26, 26, 26, 0.16)',
      },
      backgroundImage: {
        // LUXURY SILVER GRADIENTS
        'silver-gradient': 'linear-gradient(135deg, #F7F8FA 0%, #E8E9EB 100%)',
        'silver-gradient-reverse': 'linear-gradient(135deg, #E8E9EB 0%, #F7F8FA 100%)',
        'platinum-gradient': 'linear-gradient(135deg, #C8CCD0 0%, #D4D8DC 100%)',
        'black-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
        'steel-gradient': 'linear-gradient(135deg, #8D9297 0%, #6C7177 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
