export const paths = {
  // auth
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  }, // dashboard
  dashboard: {
    root: "/dashboard",
    warehouse: "/dashboard/warehouse",
    inventory: "/dashboard/inventory",
  },
  // catch all
  notFound: "*",
} as const;
