module.exports = {
  truncate(text, len) {
    if (!text) return "";
    return text.length > len ? text.substring(0, len) + "..." : text;
  },
  plus(a, b) { return a + b; },
  minus(a, b) { return a - b; },
  eq(a, b) { return a === b; },
  lt(a, b) { return a < b; },
  gt(a, b) { return a > b; },
  range(start, end) {
    let arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }
};
