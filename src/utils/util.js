
const randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

module.exports = {
  // 转换为URL查询字符串
  queryString (params, encode) {
    let items = [];
    for (let n in params) {
      let value = params[n] ? ("" + params[n]) : "";
      if (encode && value)
        value = encodeURIComponent(value);
      items.push(n + "=" + value);
    }
    return items.join("&");
  },

  // 生成随机字符串
  randomText (len) {
    let s = [], chars = randomChars;
    for (let i = 0; i < len; i++) {
      s.push(chars[Math.ceil(Math.random() * 61)]);
    }
    return s.join("");
  }
}
