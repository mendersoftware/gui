
/**
 * [1,2,3].equals([1,2,3]); // true
 * [1,2,3].equals([1,2]); // false
 * [1,2,3].equals([1,2,4]); // false
 * [1,2,3].equals("123"); // false
 * Array.prototype.equals.call("123", "123"); // true
 * Array.prototype.equals.call("123", [1,2,3]); // false
 * [1,2,3].equals([1,2,{value: 3}], (x, y) => (x.value || x) === (y.value || y)); // true
 */
Array.prototype.equals = function (other, callback = (x, y) => (x === y)) {
  // Check the other object is of the same type
  if (Object.getPrototypeOf(this) !== Object.getPrototypeOf(other)) {
    return false;
  }
  if (this.length === undefined || this.length !== other.length) {
    return false;
  }
  return Array.prototype.every.call(this, (x, i) => callback(x, other[i]));
};