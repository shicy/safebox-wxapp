// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let params = event.data || {};
  if (!params.id)
    return { code: 1, msg: "缺少必要参数" };

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    db.collection("safebox_items").doc(params.id).remove()
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          resolve({ code: 0, msg: "ok" });
        }
        else {
          resolve({ code: 1, msg: res.errMsg });
        }
      })
      .catch((err) => {
        resolve({ code: err.errCode, msg: err.errMsg });
      });
  });
};