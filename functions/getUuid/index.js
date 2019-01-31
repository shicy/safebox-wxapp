// 获取用户的唯一编号 UUID
// 新用户将会创建一个 UUID

const cloud = require('wx-server-sdk')

const randomChars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

cloud.init()

exports.main = async (event, context) => {
  let openId = cloud.getWXContext().OPENID;

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    db.collection("accounts")
      .where({ openId: openId })
      .get()
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          let data = res.data && res.data[0] || null;
          resolve({ code: 0, msg: "ok", data: (data && data.uuid || newUuid())});
        }
        else {
          resolve({ code: 1, msg: res.errMsg, data: newUuid() });
        }
      })
      .catch((err) => {
        console.log("[error]", err.errCode, err.errMsg);
        resolve({ code: err.errCode, msg: err.errMsg, data: newUuid() });
      });
  });
}

const newUuid = function () {
  let s = [];
  for (let i = 0; i < 16; i++) {
    s.push(randomChars[Math.ceil(Math.random() * 61)]);
  }
  return s.join("");
};