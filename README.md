# Calibreli - Smart PTO Planning

Calibreli is a web application designed to help employees maximize their paid time off (PTO) by intelligently combining PTO days with public holidays and weekends to create optimized vacation schedules.

## Features

- **Smart PTO Optimization**: Automatically finds the best combinations of PTO days, holidays, and weekends
- **Multiple Vacation Styles**: 
  - **Balanced Mix**: Combines long weekends and mini breaks
  - **Long Weekends**: Extends weekends around holidays for maximum relaxation
  - **Mini Breaks**: Short 2-3 day breaks distributed throughout the year
- **Flexible Planning Periods**: Set custom date ranges (perfect for fiscal years or any planning period)
- **Interactive Date Selection**: Visual calendar interface for selecting holidays and company off-days
- **Efficiency Metrics**: See how many total days off you get per PTO day used
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calibreli
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## How to Use

1. **Enter Your PTO Details**: Input the number of PTO days you have available
2. **Set Your Planning Period**: Choose specific start and end dates for your planning period (perfect for fiscal years or custom periods)
3. **Choose Your Vacation Style**: Select from Balanced Mix, Long Weekends, or Mini Breaks
4. **Add Holidays** (Optional): Use the interactive calendar to select national holidays and company-specific off days
5. **Generate Your Plan**: Click "Generate PTO Plan" to see your optimized schedule

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Date Handling**: date-fns library
- **Icons**: Lucide React
- **Deployment**: Static hosting (GitHub Pages ready)

## Project Structure

```
calibreli/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── InputForm.jsx   # Main input form
│   │   └── ScheduleView.jsx # Results display
│   ├── utils/              # Utility functions
│   │   └── ptoOptimizer.js # PTO optimization algorithm
│   ├── lib/                # Library utilities
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
└── dist/                   # Built application (after npm run build)
```

## Algorithm Overview

The PTO optimization engine uses different strategies based on your selected vacation style:

- **Long Weekends**: Identifies holidays and extends them by bridging with PTO days to create longer continuous periods off
- **Mini Breaks**: Distributes PTO days evenly throughout the planning period for regular short breaks
- **Balanced Mix**: Combines both strategies for a varied vacation schedule

The algorithm calculates efficiency ratios (total days off ÷ PTO days used) to maximize your time off impact.

## Contributing

This project follows standard React development practices. Feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
