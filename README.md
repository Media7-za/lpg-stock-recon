# LPG Stock Reconciliation System

A Progressive Web App (PWA) for LPG cylinder stock reconciliation with dual reconciliation tracking (deposit shells + gas content).

## Features

- **Dual Reconciliation**
  - Deposit Reconciliation: Tracks total cylinders (shells) = Fulls + Empties
  - Content Reconciliation: Tracks gas content in full cylinders by SKU/brand

- **CSV Import**: Upload ERP data via drag-and-drop or paste
- **Physical Count Entry**: Mobile-optimized forms for fulls (by SKU) and empties (by size with brand breakdown)
- **Real-time Variance Calculation**: Automatic reconciliation with color-coded alerts
- **Historical Tracking**: Trend analysis with interactive charts
- **Offline Support**: Works without internet connection (PWA)
- **Export**: CSV and PDF export for variance reports

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (Dark Theme)
- Dexie.js (IndexedDB)
- React Hook Form
- Recharts
- Papaparse
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### 1. Upload ERP Data

1. Export your ERP data as CSV with columns:
   - ITEM NUMBER (SKU)
   - CAT (Category: D for deposit, C for content)
   - GROUP (Size grouping)
   - DESCRIPTION
   - UOM
   - CALC. ON HAND (Quantity)

2. Navigate to "Upload CSV" and drag-drop or paste your CSV file

### 2. Create Physical Count

1. Click "New Count" on the dashboard
2. Select session type (AM/PM/EOD) and ERP snapshot
3. Enter full cylinder counts by content SKU (9.3, 9.4, 901, etc.)
4. Enter empty cylinder counts by size with brand breakdown
5. Review and complete

### 3. View Results

- View reconciliation results with dual tables (deposit and content)
- Export to CSV or PDF
- Check variance trends over time

## Data Model

### SKU Structure

- **Deposit SKUs** (.1 variants): Track total cylinders (shells)
  - 9.1, 14.1, 19.1, S.1, D.1

- **Content SKUs** (.3/.4/.01 variants): Track gas content
  - 9.3 (Easigas), 9.4 (Oryx), 901 (Generic)
  - Same pattern for 14kg, 19kg, SV, DV

### Reconciliation Logic

**Deposit Reconciliation:**
```
Physical Shells = Sum of Fulls (by size) + Empties (by size)
Variance = System (deposit SKU) - Physical Shells
```

**Content Reconciliation:**
```
Variance = System (content SKU) - Physical (content SKU)
```

## Sample Data

The app includes sample data for testing. On first load, sample ERP snapshot and count session are automatically created.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

