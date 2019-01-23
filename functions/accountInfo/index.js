// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const openId = cloud.getWXContext().OPENID;
  const db = cloud.database();

  return new Promise((resolve, reject) => {
    db.collection("accounts")
      .where({openId: openId || "none"})
      .get()
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          resolve(res.data && res.data[0] || null);
        }
        else {
          reject(res.errMsg);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}