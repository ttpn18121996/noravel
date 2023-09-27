const Str = require('./Str');

const isset = value => {
  return value !== undefined && value !== null;
};

const empty = value => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === undefined || value === null || value === false || value === '';
};

const _obj = {
  combine: (keys, values) => {
    if (keys.length < values.length) {
      for (let i = 0; i < values.length - keys.length; i++) {
        keys.push(`key_${i}`);
      }
    }
    return keys.reduce(
      (pre, cur, curIndex) => ({
          ...pre,
          [cur]: values?.[curIndex] ? values[curIndex] : null,
      }),
      {}
    );
  },

  get: (obj, keys, defaultValue = null) => {
    let result = obj;
    keys.split('.').forEach(key => {
      result = result?.[key];
    });
    if (!isset(result)) {
      if (defaultValue instanceof Function) return defaultValue();
      return defaultValue !== undefined ? defaultValue : null;
    }
    return result;
  },

  only: (obj, list) => {
    return obj
      ? Object.keys(obj).reduce((pre, cur) => {
          if (typeof list === 'string' && cur === list) {
            return { ...pre, [cur]: obj[cur] };
          } else if (Array.isArray(list) && list.includes(cur)) {
            return { ...pre, [cur]: obj[cur] };
          }
          return { ...pre };
        }, {})
      : {};
    },
    except: (obj, list) => {
      return obj
        ? Object.keys(obj).reduce((pre, cur) => {
            if (typeof list === 'string' && cur !== list) {
              return { ...pre, [cur]: obj[cur] };
            } else if (Array.isArray(list) && !list.includes(cur)) {
              return { ...pre, [cur]: obj[cur] };
            }
            return { ...pre };
          }, {})
        : {};
    },
    map: (obj, callback) => {
      const result = [];
      for (const [key, value] of Object.entries(obj)) {
        result.push(callback(value, key));
      }
      return result;
    },
};

const _str = (value = '') => new Str(value);

exports.isset = isset;
exports.empty = empty;
exports._obj = _obj;
exports._str = _str;
