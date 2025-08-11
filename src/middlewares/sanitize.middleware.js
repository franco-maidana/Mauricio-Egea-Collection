import xss from "xss";

// Limpia strings; sin etiquetas HTML permitidas
const clean = (s) =>
  xss(s, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style", "iframe"]
  });

function deepSanitize(val) {
  if (typeof val === "string") return clean(val);
  if (Array.isArray(val)) return val.map(deepSanitize);
  if (val && typeof val === "object") {
    const out = {};
    for (const k of Object.keys(val)) out[k] = deepSanitize(val[k]);
    return out;
  }
  return val;
}

function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const k of Object.keys(obj)) {
    obj[k] = deepSanitize(obj[k]); // mutamos clave por clave
  }
}

export default function sanitize(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = deepSanitize(req.body);     // OK reasignar body
  }
  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);            // NO reasignar query
  }
  if (req.params && typeof req.params === "object") {
    sanitizeInPlace(req.params);           // NO reasignar params
  }
  next();
}
