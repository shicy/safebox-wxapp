// 删除
const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  let params = event.data || {};
  if (!params.id)
    return { code: 1, msg: "缺少必要参数" };
  
  let db = cloud.database();
  return new Promise((resolve, reject) => {
    removeOneGroup(db, params.id).then(() => {
      resolve({ code: 0, msg: "ok" });
    }).catch((err) => {
      resolve({ code: err.errCode, msg: err.errMsg });
    });
  });
}

const removeOneGroup = function (db, id) {
  let collection = db.collection("safebox_groups");
  return new Promise((resolve, reject) => {
    collection.doc(id).get().then((res) => {
      if (/ok/.test(res.errMsg)) {
        let data = res.data || {};
        if (data && data._id) {
          if (data.type == 1) {
            removeChildrenGroups(db, data._id).then(() => {
              return collection.doc(id).remove();
            }).then(() => {
              resolve(data);
            }).catch(reject);
          }
          else {
            removeItems(db, data._id).then(() => {
              return collection.doc(id).remove();
            }).then(() => {
              resolve(data);
            }).catch(reject);
          }
        }
        else {
          resolve(null);
        }
      }
      else {
        reject({ errCode: 1, errMsg: res.errMsg });
      }
    }).catch(reject);
  });
};

const removeChildrenGroups = function (db, pid) {
  let collection = db.collection("safebox_groups");
  return new Promise((resolve, reject) => {
    let loop = () => { // 微信get()最多100条记录
      collection.where({ pid: pid }).get().then((res) => {
        if (/ok/.test(res.errMsg)) {
          let datas = res.data || [];
          if (datas && datas.length > 0) {
            let loop2 = (index) => {
              if (index < datas.length) {
                let data = datas[index];
                removeOneGroup(db, data._id).then(() => {
                  loop2(index + 1);
                }).catch(reject);
              }
              else {
                loop();
              }
            };
            loop2(0);
          }
          else {
            resolve();
          }
        }
        else {
          reject({ errCode: 1, errMsg: res.errMsg });
        }
      }).catch(reject);
    };
    loop();
  });
};

const removeItems = function (db, pid) {
  return db.collection("safebox_items")
    .where({ groupId: pid })
    .remove();
};