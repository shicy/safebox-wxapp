// 查询列表
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let params = {};
  params.pid = event.data.pid || "0";
  params.openId = event.userInfo.openId;

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    findGroups(db, params).then((datas) => {
      if (datas) {
        datas = datas.map((data) => {
          return {_id: data._id, name: data.name, pid: data.pid, type: data.type};
        });
      }
      resolve({ code: 0, msg: "ok", data: datas });
    }).catch((err) => {
      console.log("[error]", err.errCode, err.errMsg);
      resolve({ code: err.errCode, msg: err.errMsg });
    });
  });
};

// 查找分组
const findGroups = function (db, params) {
  let pageSize = 2;
  let _params = {pid: params.pid, _openId: params.openId};
  return new Promise((resolve, reject) => {
    let datas = [];
    let loop = (page) => {
      findOnePage(db, _params, page, pageSize).then((_datas) => {
        if (_datas && _datas.length > 0)
          datas = datas.concat(_datas);
        if (_datas && _datas.length == pageSize) {
          loop(page + 1);
        }
        else {
          resolve(datas);
        }
      }).catch((err) => {
        reject(err, datas);
      });
    };
    loop(1);
  });
};

// 分页查找
const findOnePage = function (db, params, page, size) {
  // console.log("findOnePage", params, page, size);
  return db.collection("safebox_groups")
    .where(params)
    .skip((page - 1) * size)
    .limit(size)
    .get()
    .then((res) => {
      return res && res.data;
    });
};
