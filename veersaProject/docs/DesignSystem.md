# Design System - Medical Theme

## Color Palette

### Primary Colors
- **Primary Blue**: `#0066CC` - Main brand color, used for buttons, links, and primary actions
- **Primary Blue Light**: `#4A90E2` - Hover states and lighter accents

### Secondary Colors
- **White**: `#FFFFFF` - Background for cards and content areas
- **Light Gray**: `#F5F7FA` - Subtle backgrounds and borders

### Accent Colors
- **Success Green**: `#28A745` - Success states, healthy indicators
- **Alert Red**: `#DC3545` - Error states, urgent alerts, danger actions

### Background Colors
- **Background**: `#FAFAFA` - Main page background (soft off-white)
- **Text Dark**: `#2C3E50` - Primary text color
- **Text Dark Alt**: `#34495E` - Secondary text color

## Typography

### Font Family
- **Primary**: System fonts (Inter, Roboto, or system sans-serif)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Font Sizes
- **H1**: 3rem (48px) - Main headings
- **H2**: 2rem (32px) - Section headings
- **H3**: 1.5rem (24px) - Subsection headings
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Secondary text
- **Tiny**: 0.75rem (12px) - Labels and timestamps

### Font Weights
- **Bold**: 700 - Headings and emphasis
- **Semi-bold**: 600 - Buttons and important text
- **Regular**: 400 - Body text
- **Medium**: 500 - Labels and medium emphasis

## Iconography

### Icon Style
- Medical-themed icons throughout
- Consistent style: outlined or filled (choose one style per app)
- Recognizable healthcare symbols

### Common Icons
- 🏥 Hospital/Medical facility
- 💓 Heartbeat/Health
- ❤️ Medical cross/heart
- 📅 Calendar/Appointments
- 💬 Chat bubbles
- 🎤 Microphone
- 📹 Camera/Video
- 🔒 Security/Lock

## UI Components

### Buttons

#### Primary Button
- Background: `#0066CC`
- Text: White
- Padding: 1rem 2rem
- Border-radius: 8px
- Hover: `#4A90E2`

#### Secondary Button
- Background: Transparent
- Border: 2px solid `#0066CC`
- Text: `#0066CC`
- Padding: 1rem 2rem
- Border-radius: 8px

#### Danger Button
- Background: `#DC3545`
- Text: White
- Used for logout, delete actions

### Forms

#### Input Fields
- Background: White
- Border: 2px solid `#F5F7FA`
- Border-radius: 8px
- Padding: 0.75rem
- Focus: Border color changes to `#0066CC`

#### Error States
- Border color: `#DC3545`
- Error message: Red text below input

### Cards
- Background: White
- Border-radius: 12px
- Shadow: Subtle shadow for elevation
- Padding: 1.5rem
- Hover: Slight elevation increase

### Spacing

#### Standard Spacing Scale
- 0.25rem (4px)
- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)

## Consistency Guidelines

### Web Application
- Use CSS custom properties (CSS variables) for colors
- Consistent spacing throughout
- Rounded corners (8px-12px) for soft, approachable feel
- Professional, clean appearance

### Mobile Application
- Follow React Native Paper or similar component library
- Touch targets: Minimum 44x44px
- Consistent spacing using StyleSheet
- Native platform conventions where appropriate

### Cross-Platform
- Same color palette
- Same typography hierarchy
- Consistent iconography
- Same medical theme branding

## Accessibility

### Contrast Ratios
- Text on background: Minimum 4.5:1
- Large text: Minimum 3:1
- Interactive elements: Minimum 3:1

### Interactive Elements
- Clear focus states
- Adequate touch targets (mobile)
- Keyboard navigation support (web)

