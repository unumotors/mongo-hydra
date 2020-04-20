function compare(array1, array2) {
  return array1.length === array2.length &&
    array1.sort().every(function(value, index) {
      return value === array2.sort()[index]
    })
}

/**
 * Concerts an array to a map
 *
 * e.g.
 * arrayToMap([{ user: 'a', data: {} }], 'user')
 * returns { a: { user: 'a', data: {} }}
 *
 * Is uses field as the key. Multiple fields can be passed.
 * The first one existant will be used
 *
 * @param {[]} array Array to convert
 * @param  {...string} fields Field(s) to use as key
 */
function arrayToMap(array, ...fields) {
  let map = {}
  array.forEach(entry => {
    const field = fields.find(field => entry[field])
    if (field) map[entry[field]] = entry
  })
  return map
}

module.exports = {
  arrayToMap,
  compare
}
