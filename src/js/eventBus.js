const _handlers = new Map();

export const on = (event, handler) => {
  if (!_handlers.has(event)) _handlers.set(event, new Set());
  _handlers.get(event).add(handler);
  return () => _handlers.get(event)?.delete(handler);
};

export const emit = (event, data) => {
  _handlers.get(event)?.forEach(h => h(data));
};

export const once = (event, handler) => {
  const unsub = on(event, data => { handler(data); unsub(); });
};
