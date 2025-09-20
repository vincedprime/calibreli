# Technical Design Document (TDD) for Calibreli

## 1. Project Overview

**Calibreli** is a web-based application that helps employees optimize their Paid Time Off (PTO) by aligning it with public holidays and company-specific off days. The system generates an optimized leave plan based on user preferences for different vacation styles. This project is fully static and can be deployed on GitHub Pages.

## 2. Architecture Overview
**Frontend Only (Static Web App)**
* Framework: **React.js**
* Styling: **shadcn/ui**
* State Management: React **Context API**
* Routing: **React Router**
* Build & Deployment: **Vite**, hosted on **GitHub Pages**

**Data Storage**
* Purely frontend; No datastore is needed

**High-Level Flow**
1. User inputs PTO details and other preferences - time range, company/national holidays.
2. System calculates optimized schedule.
3. Generated schedule is displayed interactively:
## Examples
- **Oct 11 – Oct 13**  
  - Total: 3 days off  
  - Uses 1 PTO day + 2 weekends  
  - Classified as a *Long Weekend*  

- **Nov 8 – Nov 16**  
  - Total: 9 days off  
  - Uses 5 PTO days + 1 public holiday + 4 weekends  
  - Classified as a *Week Break*  

- **Dec 20 – Dec 28**  
  - Total: 9 days off  
  - Uses 4 PTO days + 1 public holiday + 4 weekends  
  - Classified as a *Week Break*  


## 3. Component Design
### 3.1 Input Form Component
* Fields:
  * PTO days (number input)
  * Start Month & End Month (month picker)
  * National holidays (multi-date picker)
  * Company-specific off-days (multi-date picker)
* Vacation style selection:
  * Balanced Mix
  * Long Weekends
  * Mini Breaks
* Validations:
  * PTO days must be numeric & positive
  * Start month ≤ End month
  * Holiday dates must fall within selected months

### 3.2 PTO Optimization Engine

* Pure JavaScript module.
* Input: PTO days, holidays, off-days, style preference.
* Output: Optimized PTO schedule (array of dates or date ranges).
* Logic:
  1. Calculate all potential weekends and holidays.
  2. Allocate PTO days according to style preference:
     * **Balanced Mix:** Spread PTO days evenly across months.
     * **Long Weekends:** Extend weekends around holidays.
     * **Mini Breaks:** Short 2–3 day breaks at multiple points.
  3. Check for overlaps and constraints.
* Complexity: O(n), where n = number of days in selected range.

### 3.3 Schedule Display Component
* **Calendar View**: Highlight PTO, holidays, and weekends.
* **List View**: Shows date ranges for recommended leaves.
* **Interactions**:
  * Hover for details

### 3.4 Utility Components
* **Date Picker**
* **Dropdown / Radio Buttons**
* **Validation / Notification Toasts**
* **Responsive Layout Wrapper**

## 4. Non-Functional Design

| Requirement                 | Implementation Detail               |
| --------------------------- | ----------------------------------- |
| Responsive UI               | shadcn/ui, flexbox/grid layouts  |
| Fast Performance            | Frontend-only, optimized PTO engine |
| Accessibility               | ARIA labels, semantic HTML          |
| Cross-browser compatibility | Chrome, Firefox, Edge, Safari       |

## 5. Folder Structure

```
calibreli/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable React components
│   │   ├── InputForm.jsx
│   │   ├── ScheduleView.jsx
│   │   ├── Calendar.jsx
│   │   └── Notification.jsx
│   ├── utils/           # PTO calculation logic
│   │   └── ptoOptimizer.js
│   ├── context/         # Global state (if needed)
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

## 6. API Design

* **No backend**; all computation is client-side.

## 7. PTO Calculation Logic (High-Level Algorithm)

1. **Input**: PTO days, start/end month, holidays, company off-days, style
2. **Initialize**:

   * Array of all dates in selected range
   * Array of holidays and weekends
3. **Apply Style Rules**:

   * Balanced Mix → distribute PTO evenly
   * Long Weekends → attach PTO to existing holidays/weekends
   * Mini Breaks → create multiple short breaks
4. **Optimize**:

   * Avoid overlapping holidays
   * Ensure PTO limit not exceeded
5. **Output**: List of recommended PTO date ranges

## 8. Deployment Plan

* Build: `npm run build`
* Host: GitHub Pages (`gh-pages` branch)
* URL: `https://<username>.github.io/calibreli`
* Continuous Deployment: GitHub Actions can auto-deploy on push.


