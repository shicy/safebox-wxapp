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
          let data = res.data && res.data[0] || null;
          resolve({ code: 0, data: data });
        }
        else {
          console.log("===> error:", res);
          resolve({ code: 1, msg: res });
        }
      })
      .catch((err) => {
        console.log("[error]", err.errCode, err.errMsg);
        resolve({ code: err.errCode, msg: err.errMsg });
      });
  });
}