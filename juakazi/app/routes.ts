import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"), 
  route("signup", "auth/signup.tsx"), 
  route("login", "auth/login.tsx"),  
  route("check-email", "auth/check-email.tsx"),  
  route("logout", "auth/logout.ts"), 
  route("auth/confirm", "auth/confirm.ts"),
  route("api/jobs", "api/jobs.ts"),
  route("apply/:jobId", "application/applicationform.tsx"), 
  route("dashboard","dashboard/index.tsx",[
    index("dashboard/dashboard.tsx"), 
    route("client-dashboard", "dashboard/client-dashboard.tsx"),
    route("worker-dashboard", "dashboard/worker-dashboard.tsx"),
    route("add-job", "dashboard/add-jobs.tsx"),
    route("my-jobs", "dashboard/my-jobs.tsx"),
    route("my-posted-jobs", "dashboard/my-posted-jobs.tsx"),

  ]),
  route("jobs", "jobs/jobs.tsx", [
    index("jobs/all.tsx"),
  ]),
] satisfies RouteConfig;
