# Court Files

Frontend platform for advocates to register court cases, schedule hearings, track history, and share cause lists.

## Features

- Account registration with OTP verification (demo OTP shown on screen; no SMS backend)
- Dashboard: today's, tomorrow's, and all-case counts
- Court tabs: Civil / Session / High Courts with shareable case lists
- Add New Case with parties, judge, advocate side, next hearing, client info
- Calendar with dots on hearing dates
- Search by name, case ID, or ID card
- Hearing history when updating next dates

Data is stored in browser `localStorage` (frontend only).

## Scripts

```bash
npm start
npm test
npm run build
```
