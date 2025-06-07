import axios from "axios";

const base = process.env.REACT_APP_API_BASE || "/api";
export const api = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
});
