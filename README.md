# Art & Drawing Studio Website

A complete website for art and drawing services with CRUD operations, form submission, payment QR codes, and bill generation.

## Features

- **Navigation Menu**: Easy navigation between Home, Art, Drawings, Submit Art, Gallery, and Orders pages
- **Art Submission Form**: Complete form with all required fields
- **QR Code Payment**: Dynamic QR code display based on art position (Portrait ₹500, Landscape ₹800)
- **Payment Bill**: Generate and download payment bills
- **Gallery Management**: Full CRUD operations for art gallery items
- **Orders Management**: View, edit, and delete orders with search functionality
- **Local Storage**: All data stored in browser's localStorage

## File Structure

```
├── index.html          # Home page
├── art.html            # Art information page
├── drawings.html       # Drawings information page
├── submit-art.html     # Art submission form
├── gallery.html        # Gallery management page
├── orders.html         # Orders management page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## How to Use

1. **Open the Website**: Simply open `index.html` in your web browser
2. **Submit Art**: 
   - Go to "Submit Art" page
   - Fill out the form with your details
   - Select sheet size (A4 or A3)
   - Choose art position (Portrait ₹500 or Landscape ₹800)
   - Upload an image
   - Click Submit
3. **Payment**:
   - After submission, a QR code will be displayed
   - Click "Payment Completed" after making payment
   - Click "Generate Bill" to view/download the payment bill
4. **Gallery**: 
   - View all art items
   - Add, edit, or delete art items
5. **Orders**: 
   - View all submitted orders
   - Search, edit, or delete orders
   - Track order status (Pending Payment, Paid, Completed)

## Form Fields

- Name (required)
- Gender (required)
- Phone Number (required, 10 digits)
- Sheet Size: A4 or A3 (required)
- Art Position: Portrait (₹500) or Landscape (₹800) (required)
- Image Upload (required)
- Payment Method: Online (pre-selected)

## Technologies Used

- HTML5
- CSS3 (with responsive design)
- JavaScript (ES6+)
- LocalStorage API

## Browser Compatibility

Works on all modern browsers that support:
- HTML5
- CSS3
- ES6+ JavaScript
- LocalStorage API

## Notes

- All data is stored in browser's localStorage (client-side only)
- QR codes are generated using canvas (simple pattern)
- Images are stored as base64 in localStorage
- For production use, consider implementing a backend server

