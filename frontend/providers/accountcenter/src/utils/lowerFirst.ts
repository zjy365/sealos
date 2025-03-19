export default function lowerFirst(s: string) {
  if (typeof s !== 'string') return s;
  return s[0].toLowerCase() + s.substring(1);
}
