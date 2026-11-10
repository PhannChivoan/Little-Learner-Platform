const API_BASE = (() => {
  try {
    return window.CA_API || localStorage.getItem("ca_api") || "http://localhost:8000";
  } catch (e) {
    return "http://localhost:8000";
  }
})();
const TOKEN = {
  get() {
    try {
      return sessionStorage.getItem("ca_token") || localStorage.getItem("ca_token") || "";
    } catch (e) {
      return "";
    }
  },
  set(t, keep) {
    try {
      sessionStorage.setItem("ca_token", t);
      if (keep) localStorage.setItem("ca_token", t);
    } catch (e) {
    }
  },
  clear() {
    try {
      sessionStorage.removeItem("ca_token");
      localStorage.removeItem("ca_token");
    } catch (e) {
    }
  }
};
async function api(method, path, body) {
  const headers = {};
  const t = TOKEN.get();
  if (t) headers.Authorization = "Bearer " + t;
  const opt = { method, headers };
  if (body instanceof FormData) opt.body = body;
  else if (body !== void 0) {
    headers["Content-Type"] = "application/json";
    opt.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(API_BASE + path, opt);
  } catch (e) {
    throw new Error("Cannot reach the server. Start little-learner-backend (python run.py).");
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
  }
  if (res.status === 401 && t) {
    TOKEN.clear();
    if (typeof signOut === "function") {
      signOut();
      if (typeof navigate === "function") navigate("login");
    }
  }
  if (!res.ok) {
    const err = new Error(data.error || "Request failed (" + res.status + ")");
    err.status = res.status;
    throw err;
  }
  return data;
}
