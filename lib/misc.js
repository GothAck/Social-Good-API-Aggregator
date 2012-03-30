/*
 * Misc functions
 */
var _ = require('underscore');

// Flatten an object tree
// E.g.
//  var ot = {'one': {'two': 12, 'three': 13, 'four': {'one': 1} } }
//  var of = flatten(ot, 2);
//  of === {'one.two': 12, 'one.three': 13, 'one.four': {'one': 1}}
//  var of2 = flatten (ot, 10, '_');
//  of === {'one_two': 12, 'one_three': 13, 'one_four_one': 1}
module.exports.flatten = function flatten(object, max_depth, separator) {
  if (typeof object !== 'object') return object;
  separator = separator || '.';
  var copy = {}
  function flat (level, depth, path) {
    //console.log('flat', level, depth, path, max_depth, (depth < max_depth))
    if ((typeof level === 'object') && (max_depth ? (depth < max_depth) : true)) {
      level = _.clone(level);
      for (var key in level) {
        var value = level[key];
        flat (value, depth + 1, ((typeof path === 'string') ? path + separator : '') + key);
      }
    } else {
      copy[path] = level;
    }
  }
  flat(object, 0);
  return copy
}
