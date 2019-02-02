// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let params = event.data || {};
  if (!params.title || !params.content)
    return { code: 1, msg: "缺少必要参数" };

  let data = {};
  data.title = params.title;
  data.content = params.content;
  data.updateTime = Date.now();

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    let completeHandler = (err, ret) => {
      if (!err) {
        resolve({ code: 0, msg: "ok", data: {_id: data._id} });
      }
      else {
        resolve({ code: err.errCode, msg: err.errMsg });
      }
    };
    if (params._id) {
      update(db, data, completeHandler);
    }
    else {
      data._openId = event.userInfo.openId;
      data.groupId = params.groupId || "0";
      data.createTime = data.updateTime;
      insert(db, data, completeHandler);
    }
  });
};

const insert = function (db, data, callback) {
  db.collection("safebox_items")
    .add({ data: data })
    .then((res) => {
      if (/ok/.test(res.errMsg)) {
        data._id = res._id;
        callback(false, data);
      }
      else {
        callback({ errCode: 1, errMsg: res.errMsg });
      }
    })
    .catch(callback);
};

const update = function (db, data, callback) {
  db.collection("safe_items")
    .doc(data._id)
    .update({ data: data })
    .then((res) => {
      if (/ok/.test(res.errMsg)) {
        callback(false, data);
      }
      else {
        callback({ errCode: 1, errMsg: res.errMsg });
      }
    })
    .catch(callback);
};