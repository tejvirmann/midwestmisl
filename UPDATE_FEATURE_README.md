# Gurdwara Map Update Feature - Integration Guide

## Overview
This feature allows users to submit updates, corrections, or report missing Gurdwaras on your map.

## Files Created

### 1. `update_gurdwara_form.html`
Standalone form page for submitting updates. Beautiful, responsive design with:
- Update type selection (Missing, Incorrect, Closed, Other)
- All necessary fields (name, address, city, state/province, country)
- Details textarea for additional information
- Optional email field
- Form validation
- Success message feedback

### 2. `update_button_component.js`
Floating button component that can be added to your existing map application:
- Fixed position button in bottom-right corner
- Modal popup with embedded form
- Responsive design
- Easy integration

## Integration Options

### Option 1: Standalone Page
Simply link to `update_gurdwara_form.html`:

```html
<a href="update_gurdwara_form.html">Update Gurdwara Information</a>
```

### Option 2: Floating Button (Recommended)
Add to your existing map page:

```html
<!-- Add to your HTML -->
<script src="update_button_component.js"></script>
```

That's it! The button will automatically appear in the bottom-right corner.

### Option 3: Custom Integration
Copy the form HTML from `update_gurdwara_form.html` into your existing page.

## Backend Integration

Currently, the form saves submissions to `localStorage` as a demo. To connect to a real backend:

### Using Google Forms (Easiest)
1. Create a Google Form with matching fields
2. Get the form action URL
3. Update the form submission in the JavaScript

### Using Your Own API
Replace the TODO section in `update_gurdwara_form.html`:

```javascript
// Replace this:
console.log('Form submission:', formData);

// With this:
await fetch('YOUR_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

### Using Email (Simple Solution)
Use a service like Formspree or EmailJS:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

## Data Structure

Submissions include:
```json
{
    "updateType": "missing|incorrect|closed|other",
    "gurdwaraName": "string",
    "address": "string",
    "city": "string",
    "stateProvince": "string",
    "country": "USA|Canada",
    "details": "string",
    "email": "string (optional)",
    "timestamp": "ISO 8601 datetime"
}
```

## Customization

### Colors
Update the gradient in both files:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Button Position
Modify in `update_button_component.js`:
```css
.gurdwara-update-btn {
    bottom: 30px;  /* Change this */
    right: 30px;   /* Change this */
}
```

### Form Fields
Add/remove fields in `update_gurdwara_form.html` as needed.

## Testing

1. Open `update_gurdwara_form.html` in a browser
2. Fill out the form
3. Submit
4. Check browser console and localStorage for saved data

## Next Steps

1. Choose your integration method
2. Set up backend/email handling
3. Test the submission flow
4. Monitor submissions and update your Gurdwara database accordingly

## Support

For questions or issues, refer to the inline comments in the code files.
