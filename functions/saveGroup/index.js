// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let params = event.data || {};
  let openId = event.userInfo.openId;

  if (!params.name)
    return {code: 1, msg: "名称不能为空"};

  let data = {};
  data.name = params.name;
  data.updateTime = Date.now();

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    let collection = db.collection("safebox_groups");
    if (params._id) {
      collection.doc(params._id).update({ data: data })
        .then((res) => {
          if (/ok/.test(res.errMsg)) {
            resolve({ code: 0, msg: "ok", data: {_id: params._id} });
          }
          else {
            resolve({ code: 1, msg: res.errMsg });
          }
        })
        .catch((err) => {
          console.log("[error]", err.errCode, err.errMsg);
          resolve({ code: err.errCode, msg: "保存失败" });
        });
    }
    else {
      data._openId = openId;
      data.pid = params.pid || "0";
      data.type = parseInt(params.type) || 0;
      data.createTime = data.updateTime;
      collection.add({ data: data })
        .then((res) => {
          if (/ok/.test(res.errMsg)) {
            data._id = res._id;
            resolve({ code: 0, msg: "ok", data: data })
          }
          else {
            resolve({ code: 1, msg: res.errMsg });
          }
        })
        .catch((err) => {
          console.log("[error]", err.errCode, err.errMsg);
          resolve({ code: err.errCode, msg: err.errMsg });
        });
    }
  });
}