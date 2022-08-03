export const UUID = (n = 16) => {
  const a = new Uint16Array((n || 40) / 2);
  crypto.getRandomValues(a);
  // return Array.from(a).join('').toString().substring(0, n);
  return Array.from(a, (d) => d.toString(16).padStart(2, '0')).join('');
};

export const randomUID = () => {
  return crypto.randomUUID();
};

export const createUniqueUID = (k = 16) => {
  const l = crypto.getRandomValues(new Uint8Array(k));
  l[6] = (l[6] & 0x0f) | 0x40;
  l[8] = (l[8] & 0x3f) | 0x80;
  return l.reduce((s, u, i) => {
    s += u.toString(16);
    if (/^(3|5|7)/.test(i.toString(10))) s += '-';
    return s;
  }, '');
};
