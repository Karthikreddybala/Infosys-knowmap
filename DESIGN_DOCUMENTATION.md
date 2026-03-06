# Analytics Dashboard - Visual Design & Layout

## Dashboard Overview

The Analytics Dashboard is a comprehensive monitoring interface divided into 5 main sections:

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Knowledge Graph Analytics Dashboard                        │
│  Real-time monitoring and performance metrics                  │
│─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Total    │  │ Total    │  │ Accuracy │  │ Avg      │        │
│  │ Estimate │  │Relations │  │  89.5%   │  │Processing│        │
│  │  8,530   │  │  45,230  │  │ Quality  │  │  1.45s   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  ┌────────────────────────────────┐  ┌────────────────────────┐ │
│  │ 🔄 Processing Pipeline        │  │ 📊 Data Sources        │ │
│  │ Performance                    │  │ Accuracy               │ │
│  │                                │  │                        │ │
│  │ Text Extraction       95%  ████│  │ Wikipedia      92%  ███│ │
│  │ Tokenization         94%  ████│  │ arXiv          88%  ███│ │
│  │ NLP Analysis         88%  ███ │  │ News API       82%  ██ │ │
│  │ Entity Recognition   90%  ███ │  │ Custom Uploads 87%  ██ │ │
│  │ Relation Extraction  85%  ██  │  │                        │ │
│  │ Graph Construction   93%  ████│  │                        │ │
│  │                                │  │                        │ │
│  └────────────────────────────────┘  └────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────┐  ┌────────────────────────┐ │
│  │ 🧠 NLP Pipeline Feedback       │  │ ⚙️ Pipeline Status     │ │
│  │                                │  │                        │ │
│  │ Rate Pipeline:                 │  │ ⚫ Processing Active   │ │
│  │ ⭐⭐⭐⭐⭐ (5 stars)            │  │ Throughput: 32 docs/min│ │
│  │                                │  │ Queue Length: 12 items │ │
│  │ Feedback:                      │  │ Success Rate: 91%      │ │
│  │ ┌──────────────────────────┐  │  │                        │ │
│  │ │ Share your feedback...   │  │  │ Last Update:           │ │
│  │ │ about NLP pipeline       │  │  │ 2026-03-04 12:30:45    │ │
│  │ │                          │  │  │                        │ │
│  │ └──────────────────────────┘  │  │ [🔄 Refresh Data]      │ │
│  │                                │  │                        │ │
│  │ [Submit Feedback]             │  │                        │ │
│  │ ✓ Thank you for feedback!     │  │                        │ │
│  │                                │  │                        │ │
│  └────────────────────────────────┘  └────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 1: Key Metrics Cards (Top)

### Layout
4 equal-width cards in responsive grid:
- **Columns on Desktop**: 4 cards per row
- **Columns on Tablet**: 2 cards per row
- **Columns on Mobile**: 1 card per row

### Card Design
```
┌─────────────────────┐
│  📈 (Icon)          │
├─────────────────────┤
│ TOTAL ESTIMATE      │
│ 8,530               │
│ Documents processed │
└─────────────────────┘
```

### Card Styling
- **Background**: White
- **Border**: None
- **Radius**: 12px
- **Shadow**: `0 4px 15px rgba(0, 0, 0, 0.08)`
- **Hover Effect**: Elevates 8px with stronger shadow
- **Icon Background**: 
  - Estimate: Light blue (#e8f4f8)
  - Relations: Light yellow (#f8f3e8)
  - Accuracy: Light green (#e8f8e8)
  - Time: Light red (#f8e8e8)

### Metrics Included

| Card | Metric | Value | Unit |
|------|--------|-------|------|
| 1 | Total Estimate | Dynamic | Documents |
| 2 | Total Relations | Dynamic | Relationships |
| 3 | Extraction Accuracy | Dynamic | % |
| 4 | Avg Processing Time | Dynamic | Seconds |

---

## Section 2: Pipeline Performance (Bottom Left)

### Layout
Full-width card on left side, spans 8 columns (out of 12)

### Content Structure
```
┌──────────────────────────────────────┐
│ Header: 🔄 Processing Pipeline     │
│         Performance                  │
├──────────────────────────────────────┤
│ Stage 1: Text Extraction             │
│ └─ Success: 95% ████████████████     │
│    Time: 145ms | Count: 3,500        │
│                                       │
│ Stage 2: Tokenization                │
│ └─ Success: 94% ███████████████      │
│    Time: 85ms | Count: 3,240         │
│                                       │
│ ... (4 more stages)                  │
│                                       │
└──────────────────────────────────────┘
```

### Progress Bar Styling
- **Height**: 24px
- **Background**: Light gray (#e9ecef)
- **Border Radius**: 12px
- **Fill Color**:
  - Green (≥95%): #28a745
  - Yellow (80-95%): #ffc107
  - Red (<80%): #dc3545

### Stage Item Styling
- **Background**: Light gray (#f8f9fa)
- **Border-Left**: 4px solid (#0dcaf0)
- **Padding**: 15px
- **Border-Radius**: 8px
- **Margin-Bottom**: 20px

---

## Section 3: Data Sources Accuracy (Bottom Right)

### Layout
Full-width card on right side, spans 4 columns (out of 12)

### Content Structure
```
┌──────────────────────────────────┐
│ Header: 📊 Data Sources         │
│         Accuracy                 │
├──────────────────────────────────┤
│ Wikipedia              92%        │
│ ████████████████ [92%]           │
│ 8,500 items processed            │
│                                   │
│ arXiv                 88%         │
│ ███████████████ [88%]            │
│ 4,200 items processed            │
│                                   │
│ News API              82%         │
│ ██████████████ [82%]             │
│ 6,800 items processed            │
│                                   │
│ Custom Uploads        87%         │
│ ███████████████ [87%]            │
│ 2,100 items processed            │
│                                   │
└──────────────────────────────────┘
```

### Accuracy Bar Styling
- **Height**: 20px
- **Background**: Light gray (#e9ecef)
- **Border-Radius**: 10px
- **Color Range**:
  - Green (≥90%): #28a745
  - Yellow (75-90%): #ffc107
  - Red (<75%): #dc3545

---

## Section 4: NLP Pipeline Feedback (Bottom Left)

### Layout
Full-width card, spans 8 columns

### Content Structure
```
┌────────────────────────────────────────┐
│ Header: 🧠 NLP Pipeline Status        │
│         & Feedback                     │
├────────────────────────────────────────┤
│                                         │
│ Rate Pipeline Performance:              │
│ ⭐ ⭐ ⭐ ⭐ ⭐                         │
│                                         │
│ Feedback & Suggestions:                 │
│ ┌──────────────────────────────────┐  │
│ │ Share your feedback about the    │  │
│ │ NLP pipeline performance,        │  │
│ │ accuracy, or any issues...       │  │
│ │                                  │  │
│ └──────────────────────────────────┘  │
│                                         │
│ Your feedback helps us improve the      │
│ knowledge graph processing system       │
│                                         │
│ [Submit Feedback ────────────────────]  │
│                                         │
│ ✓ Thank you for your feedback!          │
│                                         │
└────────────────────────────────────────┘
```

### Rating System
- **Stars**: 5 clickable star buttons
- **Inactive Star**: Gray, 40% opacity
- **Active Star**: Full opacity, larger size (120%)
- **Hover Effect**: 70% opacity, scale up to 110%

### Textarea Styling
- **Border**: 2px solid #e9ecef
- **Border-Radius**: 8px
- **Padding**: 12px
- **Focus Border**: 2px solid #0dcaf0
- **Focus Shadow**: `0 0 0 0.2rem rgba(13, 202, 240, 0.25)`

---

## Section 5: Pipeline Status Overview (Bottom Right)

### Layout
Full-width card, spans 4 columns

### Content Structure
```
┌──────────────────────────────────┐
│ Header: ⚙️ Pipeline Status      │
├──────────────────────────────────┤
│                                   │
│ ⚫ Processing Active              │
│   (pulse animation)               │
│                                   │
│ Current Throughput:               │
│ 32 documents/min                  │
│                                   │
│ Queue Length:                     │
│ 12 items                          │
│                                   │
│ Success Rate:                     │
│ [Success Badge] 91%               │
│                                   │
│ ─────────────────────────────────│
│                                   │
│ Last Update:                      │
│ 2026-03-04 12:30:45 UTC          │
│                                   │
│ [🔄 Refresh Data ────────────────]│
│                                   │
└──────────────────────────────────┘
```

### Status Indicator
- **Shape**: Circle, 12px diameter
- **Color**: Green (#28a745)
- **Animation**: Pulse effect
  - Outer glow radiates every 2 seconds
  - Max radius: 8px
  - Color: rgba(40, 167, 69, 0.1)

### Status Badge Colors
- **Success (≥95%)**: Green Badge
- **Warning (80-95%)**: Yellow Badge
- **Critical (<80%)**: Red Badge

---

## Color Scheme

### Primary Colors
```
Primary Blue:    #0dcaf0
Primary Green:   #28a745
Primary Yellow:  #ffc107
Primary Red:     #dc3545
```

### Neutral Colors
```
Dark Text:       #1a1a2e
Light Text:      #6c757d
Light Gray:      #f8f9fa
Border Gray:     #e9ecef
```

### Backgrounds
```
Card Background: White
Page Background: Gradient linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
```

---

## Responsive Behavior

### Desktop (> 992px)
- All sections visible in two-column layout
- Pipeline Performance + Feedback on left (8 cols)
- Sources Accuracy + Status on right (4 cols)

### Tablet (768px - 992px)
- Metrics cards: 2 per row
- Full-width sections stack vertically

### Mobile (< 768px)
- Metrics cards: 1 per row
- All sections full-width, stacked vertically
- Font sizes reduced
- Padding reduced

---

## Animation Effects

### Card Entrance
```css
Animation: slideInUp
Duration: 0.5s
Timing: ease-out
Effect: Fade up from 30px below
```

### Card Hover
```css
Transform: translateY(-8px)
Box-shadow: Enhanced
Transition: 0.3s ease
```

### Progress Bar Fill
```css
Animation: Smooth width change
Duration: 0.3s
Timing: ease
```

### Status Pulse
```css
Animation: pulse 2s infinite
Effect: Expanding glow ring
Colors: rgba(40, 167, 69, 0.7) → transparent
```

### Rating Star Interaction
```css
Inactive: opacity: 0.4
Hover: opacity: 0.7, scale: 1.1
Active: opacity: 1.0, scale: 1.2
```

---

## Typography

### Headers
- **Dashboard Title**: 2.5rem, Bold (700)
- **Section Headers**: 1.25rem, Semi-bold (600)
- **Card Headers**: 1rem, Semi-bold (600)

### Body Text
- **Metric Values**: 2.2rem, Bold (700)
- **Labels**: 0.9rem, Semi-bold (600)
- **Description**: 0.85rem, Regular (400)

### Font Family
```
Primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
```

---

## Spacing & Layout

### Card Spacing
- **Margin Between Cards**: 12-20px
- **Card Padding**: 20-25px
- **Internal Spacing**: 8-15px

### Grid Columns
- **Desktop**: 12-column grid
- **Pipeline + Feedback**: 8 columns
- **Accuracy + Status**: 4 columns each

---

## Interactive Elements

### Buttons
- **Style**: Solid background
- **Padding**: 10px 20px
- **Border-Radius**: 6px
- **Transition**: 0.2s ease

### Input Fields
- **Border**: 2px solid #e9ecef
- **Focus Border**: 2px solid #0dcaf0
- **Border-Radius**: 8px
- **Padding**: 8-12px

### Links & Navigation
- **Color**: #0dcaf0
- **Hover**: Darker shade
- **Underline**: On hover
- **Transition**: 0.2s ease

---

## Performance Metrics Display

### Success Rate Color Coding
```
95-100% ─ Green   ████████████████████
80-95%  ─ Yellow  ████████████████
<80%    ─ Red     ████████████
```

### Processing Time Interpretation
```
<1.0s   ─ Excellent
1.0-2.0s ─ Good
>2.0s   ─ Needs Review
```

### Data Quality Levels
```
≥90%    ─ Excellent (Green badge)
75-90%  ─ Good (Yellow badge)
<75%    ─ Review Required (Red badge)
```

---

## Accessibility Features

- **High Contrast**: Text meets WCAG AA standards
- **Focus Indicators**: Clear blue outline on focus
- **Icon Labels**: All icons have text labels
- **Color Blind**: Patterns used alongside colors
- **Keyboard Navigation**: All interactive elements accessible

---

## Screenshot References

### Full Dashboard
```
Width: 1920px
Height: 1200px (minimum viewport)
Responsive down to 320px width
```

### Print-Friendly
- Optimized for PDF export
- Color-adjusted for B&W printing
- All sections visible on A4 paper (landscape)

---

This design provides an intuitive, professional interface for monitoring the Knowledge Graph processing system with real-time metrics, performance visualization, and user feedback collection.
