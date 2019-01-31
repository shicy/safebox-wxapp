// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
// 参数：{name, password}
exports.main = async (event, context) => {
  let data = event.data || {};
  console.log(data);

  if (!(data.uuid && data.password))
    return {code: 1, msg: "缺少必要参数"};

  let account = {
    openId: cloud.getWXContext().OPENID,
    uuid: data.uuid,
    type: 2, // 普通用户
    username: "",
    password: data.password
  };
  account.createdTime = account.updateTime = Date.now();

  return new Promise((resolve, reject) => {
    let db = cloud.database();
    db.collection("accounts")
      .add({data: account})
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          account._id = res._id;
          resolve({code: 0, data: account });
        }
        else {
          console.log("error", res)
          reject(res);
        }
      });
  });
}