import { useAuthStore } from "../store/auth";

export function authHeader() {
  const auth = useAuthStore();
  return { Authorization: `Bearer ${auth.token}` };
}
