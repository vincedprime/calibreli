# Software Requirements Specification (SRS)

## Project Overview
Calibreli is a web application for planning paid time off (PTO) in a selected period. By combining PTO days with public holidays and company-specific off days, the app suggests a leave plan tailored to user preferences.

## Purpose
-   Provide employees with a tool to plan vacations efficiently.
-   Help users identify efficient ways to align PTO with holidays.
-   Offer flexible vacation planning styles to suit different user needs.

## Scope
-   Web-based application accessible on desktop and mobile browsers.
-   Fully static
-   Users input their PTO, time range (start month to end month), dates of national holidays
-   System generates leave recommendations based on preferences.


## Functional Requirements
-   Allow users to enter the number of PTO days, time range (start month to end month), dates of national holidays
-   Enable users to choose a vacation planning style:
    -   Balanced Mix
    -   Long Weekends
    -   Mini Breaks
-   Allow users to add custom company off-days.
-   Generate a PTO schedule.

## Non-Functional Requirements
-   User-friendly and responsive UI for desktop and mobile.
-   Fast and reliable performance for generating plans.
