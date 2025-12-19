# Landing Super Admin Panel

A comprehensive React.js admin panel system for managing landing pages, sub admins, and leads with role-based access control.

## Features

### 🚀 Core Functionality
- **Super Admin Dashboard**: Complete control over all landing pages, sub admins, and leads
- **Sub Admin Management**: Create and manage sub admin accounts with specific landing page access
- **Landing Page Management**: Create, edit, and manage multiple landing pages
- **Lead Management**: Comprehensive lead tracking and management system
- **Access Control**: Role-based permissions and access management

### 👥 User Roles
- **Super Admin**: Full system access, can manage all landing pages and sub admins
- **Sub Admin**: Limited access to assigned landing page and its leads

### 📊 Dashboard Features
- Real-time statistics and analytics
- Lead filtering and search capabilities
- Export functionality for leads
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js 18
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Backend API server running (see backend setup)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd landing_super_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   │   ├── Login.js         # Login form
│   │   └── SubAdminRegistration.js  # Sub admin registration
│   ├── super-admin/         # Super admin components
│   │   ├── SuperAdminDashboard.js   # Main dashboard
│   │   ├── DashboardStats.js        # Statistics overview
│   │   ├── LandingPages.js          # Landing page management
│   │   ├── SubAdmins.js             # Sub admin management
│   │   ├── AccessRequests.js        # Access request handling
│   │   └── AllLeads.js              # All leads overview
│   ├── sub-admin/           # Sub admin components
│   │   ├── SubAdminDashboard.js    # Sub admin dashboard
│   │   ├── SubAdminStats.js        # Sub admin statistics
│   │   ├── SubAdminLeads.js        # Lead management
│   │   └── SubAdminProfile.js      # Profile management
│   └── LandingPage.js       # Public landing page
├── contexts/
│   └── AuthContext.js       # Authentication context
├── services/
│   └── api.js              # API service layer
├── App.js                  # Main application component
└── index.js                # Application entry point
```

## API Endpoints

The application expects the following backend API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Super Admin
- `GET /api/super-admin/landing-pages` - Get all landing pages
- `POST /api/super-admin/landing-pages` - Create landing page
- `PUT /api/super-admin/landing-pages/:id` - Update landing page
- `DELETE /api/super-admin/landing-pages/:id` - Delete landing page
- `GET /api/super-admin/sub-admins` - Get all sub admins
- `POST /api/super-admin/sub-admins` - Create sub admin
- `GET /api/super-admin/access-requests` - Get access requests
- `POST /api/super-admin/access-requests/:id/approve` - Approve access request
- `GET /api/super-admin/leads` - Get all leads

### Sub Admin
- `GET /api/sub-admin/profile` - Get sub admin profile
- `PUT /api/sub-admin/profile` - Update sub admin profile
- `GET /api/sub-admin/landing-page` - Get assigned landing page
- `GET /api/sub-admin/leads` - Get leads for assigned landing page
- `GET /api/sub-admin/dashboard-stats` - Get dashboard statistics

### Landing Pages
- `POST /api/landing-pages/:id/leads` - Submit lead for landing page

## Usage

### Super Admin
1. **Login** with super admin credentials
2. **Dashboard**: View system overview and statistics
3. **Landing Pages**: Create and manage landing pages
4. **Sub Admins**: Create and manage sub admin accounts
5. **Access Requests**: Review and approve sub admin registration requests
6. **All Leads**: View and manage leads from all landing pages

### Sub Admin
1. **Register** for sub admin access (requires super admin approval)
2. **Login** with approved credentials
3. **Dashboard**: View assigned landing page and lead statistics
4. **Leads**: Manage leads from assigned landing page
5. **Profile**: Update personal information

### Public Users
1. **Visit** any landing page
2. **Submit** lead information through contact forms
3. **Receive** confirmation of submission

## Demo Credentials

For testing purposes, you can use these demo accounts:

- **Super Admin**: `admin@example.com` / `password123`
- **Sub Admin**: `subadmin@example.com` / `password123`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for better UX

## Deployment

### Deploying to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import your project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In Vercel Dashboard, go to: **Settings → Environment Variables**
   - Add the following variable:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: `https://super-backend-eosin.vercel.app/api` (or your production API URL)
   - Apply to: **Production**, **Preview**, and **Development**

4. **Deploy**
   - Vercel will automatically detect the build settings from `vercel.json`
   - The build command is: `npm run build`
   - Output directory: `build`
   - SPA routing is configured automatically

5. **Verify Deployment**
   - After deployment, test all routes to ensure React Router works correctly
   - Check that API calls are working with the production backend

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Configure environment variables** for production

4. **Update API endpoints** to point to production backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions:
- Check the documentation
- Review the code examples
- Open an issue on GitHub

## License

This project is licensed under the MIT License.

---

**Note**: This frontend application requires a corresponding backend API server to function properly. Make sure your backend is running and accessible before testing the frontend features. 