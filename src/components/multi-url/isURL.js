const pattern =
  /((http([s]){0,1}:\/\/){0,1}(([:]){0,1}[\0-9]{4}){0,1}\/{0,1}){1}/g;
const otherOrigin = /(\*|null)/;
function isURL(str) {
  if (pattern.test(str)) {
    return true;
  }
  if (otherOrigin.test(str)) {
    return true;
  }
  return false;
}
export default isURL;
