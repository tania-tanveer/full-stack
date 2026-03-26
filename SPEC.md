# ShopNova - Amazon-like E-Commerce Platform

## 1. Project Overview

**Project Name:** ShopNova  
**Type:** Full-stack E-Commerce Web Application  
**Core Functionality:** A professional Amazon-like online marketplace featuring product browsing, advanced search, shopping cart, user authentication, and checkout functionality.  
**Target Users:** Online shoppers looking for a premium shopping experience with diverse product categories.

---

## 2. Technical Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3 (file-based, no setup required)
- **Authentication:** JWT tokens
- **API:** RESTful JSON API

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Styling:** Custom CSS with CSS Variables

---

## 3. UI/UX Specification

### Color Palette
| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Deep Teal | `#0a3d3d` |
| Secondary | Warm Gold | `#d4a574` |
| Accent | Coral Orange | `#e07a5f` |
| Background | Off-White | `#faf9f7` |
| Surface | Pure White | `#ffffff` |
| Text Primary | Charcoal | `#1a1a1a` |
| Text Secondary | Slate Gray | `#5a5a5a` |
| Border | Light Gray | `#e5e5e5` |
| Success | Emerald | `#2d9d78` |
| Error | Crimson | `#d64545` |

### Typography
- **Primary Font:** "Playfair Display" (headings) - elegant serif
- **Secondary Font:** "DM Sans" (body) - clean modern sans-serif
- **Font Sizes:**
  - Hero Title: 56px
  - Section Title: 36px
  - Card Title: 20px
  - Body: 16px
  - Small: 14px

### Layout Structure

#### Header (Fixed)
- Height: 70px
- Logo (left): "ShopNova" in Playfair Display
- Search bar (center): Rounded input with search icon
- Navigation (right): Account, Orders, Cart with badge
- Background: `#0a3d3d` with white text

#### Hero Section
- Full-width banner with gradient overlay
- Height: 500px
- Animated text reveal
- Call-to-action button

#### Product Categories
- Horizontal scrollable cards
- Icon + category name
- Subtle hover lift effect

#### Product Grid
- 4 columns on desktop, 2 on tablet, 1 on mobile
- Card hover: subtle shadow + scale
- Quick "Add to Cart" button on hover

#### Footer
- 4-column layout
- Dark background `#1a1a1a`
- Newsletter signup
- Social links

### Responsive Breakpoints
- Desktop: ≥1200px
- Tablet: 768px - 1199px
- Mobile: <768px

### Components

#### Product Card
- Image container with aspect ratio 4:3
- Wishlist heart icon (top-right)
- Product title (2 lines max, ellipsis)
- Rating stars (visual only)
- Price: Original (strikethrough) + Sale price
- "Add to Cart" button
- Hover: Shadow elevation + slight scale

#### Shopping Cart (Slide-out Panel)
- Slides in from right
- Dark overlay backdrop
- Item list with quantity controls
- Remove item button
- Subtotal calculation
- "Proceed to Checkout" button

#### Checkout Modal
- Multi-step form
- Step 1: Shipping Address
- Step 2: Payment (mock)
- Step 3: Review & Confirm
- Order confirmation with animation

#### User Account Dropdown
- Profile icon
- Dropdown menu: My Orders, Wishlist, Settings, Logout

### Animations & Effects
- Page load: Staggered fade-in for cards
- Button hover: Background color transition 0.3s
- Card hover: Transform scale(1.02), box-shadow
- Cart slide: translateX animation 0.3s
- Modal: Fade + scale in
- Loading spinner: Rotating circle

---

## 4. Functionality Specification

### Backend API Endpoints

#### Products
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/search?q=` - Search products
- `GET /api/categories` - List categories

#### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update quantity
- `DELETE /api/cart/remove/:id` - Remove item

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

#### Users
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Product Categories
1. Electronics & Gadgets
2. Fashion & Apparel
3. Home & Living
4. Beauty & Skincare
5. Sports & Outdoors
6. Books & Media

### Sample Products (20 items)
Each category will have 3-4 products with:
- High-quality placeholder images
- Product name
- Description
- Original price
- Sale price (10-30% discount)
- Rating (4-5 stars)
- Stock status

### User Features
- Browse products without login
- Add to cart (requires login)
- Checkout (requires login)
- View order history
- Wishlist (requires login)

---

## 5. Project Structure

```
full stack/
├── backend/
│   ├── server.js          # Express server entry
│   ├── database.js        # SQLite setup
│   ├── routes/
│   │   ├── products.js    # Product endpoints
│   │   ├── cart.js        # Cart endpoints
│   │   ├── orders.js      # Order endpoints
│   │   └── auth.js        # Auth endpoints
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   └── data/
│       └── seed.js        # Sample data
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # React entry
│   │   ├── App.jsx        # Main component
│   │   ├── index.css      # Global styles
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Orders.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   └── api/
│   │       └── index.js  # Axios setup
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── package.json           # Root package.json
```

---

## 6. Acceptance Criteria

### Visual Checkpoints
- [ ] Header is fixed and has dark teal background
- [ ] Hero section displays with animated text
- [ ] Product cards show in responsive grid
- [ ] Cart slides in from right side
- [ ] Footer has 4-column layout with dark background
- [ ] All fonts load correctly (Playfair Display, DM Sans)
- [ ] Color scheme matches specification
- [ ] Hover effects work on cards and buttons

### Functional Checkpoints
- [ ] Products load from backend API
- [ ] Search filters products
- [ ] Category filter works
- [ ] Add to cart updates cart count
- [ ] Cart persists (in localStorage or database)
- [ ] Login/Register works
- [ ] Checkout flow completes
- [ ] Orders appear in user account

### Technical Checkpoints
- [ ] Backend runs on port 3001
- [ ] Frontend runs on port 5173
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] API endpoints return correct data
