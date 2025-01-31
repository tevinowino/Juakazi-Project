import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about-us", "routes/about-us.tsx"),
  route("contact-us", "routes/contact.tsx"), 
  route("signup", "auth/signup.tsx"), 
  route("login", "auth/login.tsx"),  
  route("check-email", "auth/check-email.tsx"),  
  route("logout", "auth/logout.ts"), 
  route("auth/confirm", "auth/confirm.ts"),
  route("api/jobs", "api/jobs.ts"),
  route("api/apply", "api/applications.ts"),
  route("apply/:jobId", "application/applicationform.tsx"), 
  route("dashboard","dashboard/index.tsx",[
    index("dashboard/dashboard.tsx"), 
    route("client-dashboard", "dashboard/client-dashboard.tsx"),
    route("worker-dashboard", "dashboard/worker-dashboard.tsx"),
    route("add-job", "dashboard/add-jobs.tsx"),
    route("my-jobs", "dashboard/my-jobs.tsx"),
    route("my-posted-jobs", "dashboard/my-posted-jobs.tsx"),
    route("my-applications", "dashboard/my-applications.tsx"),

  ]),
  route("jobs", "jobs/jobs.tsx", [
    index("jobs/all.tsx"),
  ]),
] satisfies RouteConfig;
