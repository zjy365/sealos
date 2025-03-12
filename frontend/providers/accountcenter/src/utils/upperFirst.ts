export default function upperFirst(s: string) {
  if (typeof s !== 'string') return s;
  return s[0].toUpperCase() + s.substring(1);
}
