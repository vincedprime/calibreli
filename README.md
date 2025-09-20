# Calibreli - PTO Optimizer

A web application that helps employees maximize their paid time off (PTO) by combining it with public holidays and company-specific off days to generate an optimized leave plan.

## Features

- **Smart PTO Optimization**: Three different vacation styles to suit your needs:
  - **Balanced Mix**: Spread PTO days evenly across months
  - **Long Weekends**: Extend weekends around holidays for maximum time off
  - **Mini Breaks**: Create multiple short 2-3 day breaks throughout the year

- **Flexible Planning**: 
  - Set your PTO days and planning period
  - Add national holidays and company-specific off days
  - Choose your preferred vacation style

- **Interactive Calendar**: 
  - Visual calendar view showing PTO days, holidays, and weekends
  - List view for detailed schedule information
  - Hover tooltips for additional context

- **Data Management**:
  - Save and load PTO plans locally
  - Export schedules as JSON or CSV
  - Import/export functionality for sharing plans

- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vinay/calibreli.git
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

The built files will be in the `dist` directory.

## Usage

1. **Enter PTO Details**: Specify the number of PTO days you have available
2. **Set Planning Period**: Choose your start and end dates for the planning period
3. **Add Holidays**: Select national holidays and company-specific off days
4. **Choose Style**: Pick your preferred vacation planning style
5. **Generate Schedule**: Click "Generate PTO Schedule" to see your optimized plan
6. **View Results**: Switch between calendar and list views to see your schedule
7. **Save & Export**: Save your plan locally or export it for sharing

## Vacation Styles Explained

### Balanced Mix
Distributes your PTO days evenly across the months in your planning period. This approach ensures you get regular breaks throughout the year without long gaps between time off.

### Long Weekends
Focuses on extending weekends around holidays to maximize consecutive days off. This style is perfect if you prefer longer vacation periods and want to make the most of existing holidays.

### Mini Breaks
Creates multiple short 2-3 day breaks at strategic points throughout the year. Ideal for those who prefer frequent short breaks over long vacations.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch. The live application can be accessed at: https://vinay.github.io/calibreli

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Privacy

This application runs entirely in your browser. No data is sent to external servers. All your PTO plans and preferences are stored locally using your browser's localStorage.