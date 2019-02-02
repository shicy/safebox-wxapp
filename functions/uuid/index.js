// 获取用户的唯一编号 UUID

const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let db = cloud.database();
  return new Promise((resolve, reject) => {
    db.collection("accounts")
      .where({ _openId: event.userInfo.openId })
      .get()
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          let data = res.data && res.data[0] || null;
          resolve({ code: 0, msg: "ok", data: data && data.uuid });
        }
        else {
          resolve({ code: 1, msg: res.errMsg });
        }
      })
      .catch((err) => {
        console.log("[error]", err.errCode, err.errMsg);
        resolve({ code: err.errCode, msg: err.errMsg });
      });
  });
}