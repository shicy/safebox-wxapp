// 获取加密项

const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  let params = {};
  params.groupId = event.data.groupId || "0";

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    db.collection("safebox_items")
      .where(params)
      .get()
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          resolve({ code: 0, msg: "ok", data: res.data });
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