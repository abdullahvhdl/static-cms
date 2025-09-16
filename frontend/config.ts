// Admin configuration
// TODO: In production, set these values securely and use environment variables
export const adminConfig = {
  // The admin password for accessing the CMS admin panel
  // IMPORTANT: Change this from the default value in production
  password: "admin123",
  
  // Session timeout in hours
  sessionTimeoutHours: 24,
  
  // Whether to show the demo password hint in the login form
  showPasswordHint: false
};

// Site configuration
export const siteConfig = {
  // Default site settings
  defaultTitle: "My Static CMS",
  defaultDescription: "A simple static content management system"
};
