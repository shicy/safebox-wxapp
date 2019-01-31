
const randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

module.exports = {
  // 生成随机字符串
  randomText (len) {
    var s = [], chars = randomChars;
    for (var i = 0; i < len; i++) {
      s.push(chars[Math.ceil(Math.random() * 61)]);
    }
    return s.join("");
  }
}
