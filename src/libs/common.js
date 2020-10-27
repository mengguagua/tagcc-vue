// Date.prototype.format = function (format) {
//   format = format || 'yyyy/MM/dd hh:mm'
//   let o = {
//     'M+': this.getMonth() + 1,
//     'd+': this.getDate(),
//     'h+': this.getHours(),
//     'm+': this.getMinutes(),
//     's+': this.getSeconds(),
//     'q+': Math.floor((this.getMonth() + 3) / 3),
//     S: this.getMilliseconds()
//   }
//   if (/(y+)/.test(format)) {
//     format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
//   }
//   for (let k in o) {
//     if (new RegExp('(' + k + ')').test(format)) {
//       format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
//     }
//   }
//   return format
// }
//
// Number.prototype.cutFixed = function (n) {
//   return this.toString().cutFixed(n)
// }
// String.prototype.cutFixed = function (n) {
//   let t = this.split('.')
//   let s = '000000000000000000000000000000'
//   if (n) {
//     if (/\./.test(this)) {
//       return [t[0], (t[1] + s).substr(0, n)].join('.')
//     } else {
//       return [this, s.substr(0, n)].join('.')
//     }
//   } else {
//     return this
//   }
// }
// Number.prototype.fullNumber = function () {
//   return this < 10 ? '0' + this : this
// }

const Cookie = {
  read (name) {
    let value = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)')
    return value ? decodeURIComponent(value[1]) : null
  },
  write (value) {
    let str = value.name + '=' + encodeURIComponent(value.value)
    if (value.domain) {
      str += '; domain=' + value.domain
    }
    if (value.path) {
      str += '; path=' + value.path
    }
    if (value.day) {
      let time = new Date()
      time.setTime(time.getTime() + value.day * 24 * 60 * 60 * 1000)
      str += '; expires=' + time.toGMTString()
    }
    document.cookie = str
  },
  dispose (name) {
    let str = this.read(name)
    this.write({
      name: name,
      value: str,
      day: -1
    })
  }
}

const cookie = (name, value, option) => {
  let op = {
    name,
    value
  }
  if (value) {
    if (option) {
      Object.assign(op, option)
    }
    Cookie.write(op)
  } else if (value === null) {
    Cookie.dispose(name)
  } else {
    return Cookie.read(name)
  }
}

export {
  cookie
}
