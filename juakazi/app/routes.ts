import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),  // Home page as the default route
  route("signup", "auth/signup.tsx"),  // Sign-up page
  route("login", "auth/login.tsx"),  // Login page
  route("check-email", "auth/check-email.tsx"),  // Check email page
  route("logout", "auth/logout.ts"),  // Logout page
  route("auth/confirm", "auth/confirm.ts"),  // Email confirmation page
  route("dashboard","dashboard/index.tsx",[
    index("dashboard/dashboard.tsx")  // Default route for the dashboard
  ]),
] satisfies RouteConfig;
