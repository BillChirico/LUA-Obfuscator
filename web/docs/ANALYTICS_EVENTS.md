# Google Analytics Event Tracking

This document details all the analytics events tracked in the Lua Obfuscator application.

## Overview

The application uses Google Analytics 4 (GA4) with both client-side (gtag.js) and server-side (Measurement Protocol) tracking to capture comprehensive user behavior and performance metrics.

## 📊 Event Categories

### 1. **Session Events**

#### `session_start`

Tracks when a user first loads the application.

**Parameters:**

- `user_type`: "new" | "returning" - Whether the user has visited before
- `timestamp`: number - Unix timestamp of session start

**Triggered:** On app mount (useEffect)

---

#### `time_on_page`

Tracks total time spent on the application.

**Parameters:**

- `seconds`: number - Total seconds on page
- `minutes`: number - Total minutes on page (rounded down)

**Triggered:** When user leaves the page (useEffect cleanup)

---

### 2. **Obfuscation Events**

#### `obfuscate_code`

Main event for tracking code obfuscation actions.

**Parameters:**

- `obfuscation_type`: "mangle" | "encode" | "minify" | "mangle_encode" | "full"
- `code_size`: number - Input code size in bytes
- `protection_level`: number - Protection level (0-100)

**Triggered:** When user successfully obfuscates code

---

#### `obfuscation_performance`

Performance metrics for obfuscation operations.

**Parameters:**

- `input_size`: number - Input code size in bytes
- `output_size`: number - Output code size in bytes
- `duration_ms`: number - Time taken to obfuscate (milliseconds)
- `size_ratio`: number - Output size / input size ratio
- `size_increase_percent`: number - Percentage increase in size

**Triggered:** After each successful obfuscation

---

#### `obfuscation_milestone`

Celebrates user engagement milestones.

**Parameters:**

- `total_obfuscations`: number - Total count (1, 5, 10, 25, or 50)
- `milestone`: "new_user" | "regular_user" | "power_user"

**Triggered:** At 1st, 5th, 10th, 25th, and 50th obfuscation

---

### 3. **Settings & Configuration Events**

#### `protection_level_change`

Tracks changes to the protection level slider.

**Parameters:**

- `old_level`: number - Previous protection level (0-100)
- `new_level`: number - New protection level (0-100)
- `change_type`: "slider" | "preset"
- `level_difference`: number - Absolute difference between old and new

**Triggered:** When user moves the protection level slider

---

#### `change_settings`

Tracks individual setting toggle changes.

**Parameters:**

- `setting_name`: string - Name of the setting (e.g., "mangleNames", "encodeStrings")
- `setting_value`: string - String representation of the new value

**Triggered:** When user toggles any obfuscation setting switch

---

#### `feature_combination`

Analyzes which combinations of features users prefer.

**Parameters:**

- `features`: string - Comma-separated list of enabled features (e.g., "mangle,strings,minify")
- `feature_count`: number - Number of enabled features (0-5)
- `protection_level`: number - Current protection level

**Triggered:** After each successful obfuscation

---

### 4. **Output Actions**

#### `download_obfuscated_code`

Tracks when users download the obfuscated code.

**Parameters:**

- `code_size`: number - Size of downloaded code in bytes

**Triggered:** When user clicks the download button

---

#### `copy_obfuscated_code`

Tracks when users copy code to clipboard.

**Parameters:**

- `code_size`: number - Size of copied code in bytes

**Triggered:** When user clicks the copy button

---

### 5. **Error Events**

#### `obfuscation_error`

Captures errors during obfuscation.

**Parameters:**

- `error_type`: "parse_error" | "obfuscation_error"
- `error_message`: string | undefined - Error details

**Triggered:** When obfuscation fails

---

### 6. **Additional Tracking Functions**

These functions are implemented but need UI integration:

#### `sample_code_selected`

**Parameters:** `sample_name`: string

#### `code_input`

**Parameters:**

- `input_method`: "typing" | "paste" | "sample"
- `code_length`: number
- `has_existing_code`: boolean

#### `clear_code`

**Parameters:** `clear_type`: "input" | "output" | "both"

#### `code_comparison`

**Parameters:**

- `view_duration_seconds`: number
- `had_side_scroll`: boolean

#### `ui_interaction`

**Parameters:**

- `element_name`: string
- `interaction_type`: string
- `context`: string | undefined

#### `share_app`

**Parameters:** `share_method`: "link" | "social" | "embed"

#### `feedback_submitted`

**Parameters:**

- `rating`: number | undefined
- `feedback_type`: "bug" | "feature" | "general"
- `has_message`: boolean

---

## 📈 Analytics Implementation

### Client-Side Tracking

- **Location:** `lib/analytics-client.ts`
- **Method:** Sends events to `/api/analytics/track` endpoint
- **Benefits:** Secure (API secret hidden), reliable tracking

### Server-Side Tracking

- **Location:** `lib/analytics-server.ts`
- **Method:** GA4 Measurement Protocol API
- **Benefits:** Works even with ad blockers, server-side validation

### Integration Points

**Main Page Component** (`app/page.tsx`):

- Session tracking on mount/unmount
- Protection level slider changes
- Settings toggle changes
- Obfuscation actions with performance metrics
- Error tracking
- Milestone tracking

---

## 🔧 Setup Instructions

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Add a web data stream

### 2. Get Credentials

- **Measurement ID**: `G-XXXXXXXXXX` (from data stream)
- **API Secret**: Generate in data stream settings → Measurement Protocol API secrets

### 3. Configure Environment Variables

**Local (.env.local):**

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
GA_MEASUREMENT_PROTOCOL_API_SECRET=your_secret_here
```

**Vercel:**
Add the same variables in Project Settings → Environment Variables

### 4. Create Custom Dimensions (Recommended)

In GA4: **Admin** → **Custom definitions** → **Create custom dimension**

| Dimension Name   | Event Parameter    | Scope |
| ---------------- | ------------------ | ----- |
| Obfuscation Type | `obfuscation_type` | Event |
| Protection Level | `protection_level` | Event |
| Code Size        | `code_size`        | Event |
| Error Type       | `error_type`       | Event |
| User Type        | `user_type`        | Event |
| Feature Count    | `feature_count`    | Event |
| Setting Name     | `setting_name`     | Event |
| Size Ratio       | `size_ratio`       | Event |
| Duration (ms)    | `duration_ms`      | Event |

---

## 📊 Suggested GA4 Reports

### Engagement Report

- **Dimensions:** Event name, User type
- **Metrics:** Event count, Total users
- **Filters:** event_name contains "obfuscate" OR "settings" OR "download"

### Performance Analysis

- **Dimensions:** Protection level, Feature count
- **Metrics:** Average duration_ms, Average size_ratio
- **Visualization:** Line chart showing performance vs protection level

### Feature Popularity

- **Dimensions:** Features (comma-separated)
- **Metrics:** Event count
- **Filters:** event_name = "feature_combination"

### User Journey

- **Dimensions:** Milestone
- **Metrics:** Users
- **Filters:** event_name = "obfuscation_milestone"

### Error Tracking

- **Dimensions:** Error type, Error message
- **Metrics:** Event count
- **Filters:** event_name = "obfuscation_error"

---

## 🧪 Testing

### Local Testing

```bash
npm run dev
```

Open browser console and watch for analytics logs

### View Real-Time Events

1. Go to GA4 → **Reports** → **Realtime**
2. Perform actions in your app
3. See events appear within seconds

### Debug Mode

Enable in browser console:

```javascript
window.gtag("config", "G-XXXXXXXXXX", { debug_mode: true });
```

Then check **Admin** → **DebugView**

---

## 📝 Event Summary

| Category                 | Events                                                         | Total |
| ------------------------ | -------------------------------------------------------------- | ----- |
| Session                  | session_start, time_on_page                                    | 2     |
| Obfuscation              | obfuscate_code, obfuscation_performance, obfuscation_milestone | 3     |
| Settings                 | protection_level_change, change_settings, feature_combination  | 3     |
| Output                   | download_obfuscated_code, copy_obfuscated_code                 | 2     |
| Errors                   | obfuscation_error                                              | 1     |
| Additional (implemented) | 6+ more ready for UI integration                               | 6     |
| **TOTAL**                | **17+** events tracked                                         |

---

## 🎯 Key Insights You Can Track

1. **User Engagement**
   - New vs returning users
   - Time spent on app
   - Obfuscation frequency

2. **Feature Usage**
   - Most popular obfuscation types
   - Protection level preferences
   - Feature combinations

3. **Performance**
   - Obfuscation speed
   - Code size changes
   - Performance impact of protection levels

4. **User Journey**
   - First-time experience
   - Power user behavior
   - Drop-off points

5. **Errors**
   - Parse error frequency
   - Common error patterns
   - Error recovery rate

---

## 🔒 Privacy & Security

- API secret is kept server-side only
- No personally identifiable information (PII) is tracked
- User code is never sent to analytics
- Only metadata (size, settings, timing) is tracked
- Client IDs are stored locally and anonymized

---

## 📚 References

- [GA4 Measurement Protocol Documentation](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [GA4 Event Parameters](https://support.google.com/analytics/answer/9267735)
- [Custom Dimensions Guide](https://support.google.com/analytics/answer/10075209)
