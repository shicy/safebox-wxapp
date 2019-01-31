// 登录
// 参数：uuid, password, auto-是否自动创建并登录

const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {
  let params = event.data || {};
  let openId = event.userInfo.openId;

  if (!params.uuid || !params.password)
    return { code: 1, msg: "缺少必要参数" };

  let db = cloud.database();
  return new Promise((resolve, reject) => {
    getUser(db, openId, (user) => {
      if (user) {
        if (user.uuid != params.uuid) {
          resolve({ code: 1, msg: "登录异常，拒绝登录！" });
        }
        else if (user.password != params.password) {
          resolve({ code: 2, msg: "登录错误" });
        }
        else {
          loginLogger(db, user, () => {
            resolve({ code: 0, msg: "ok", data: user });
          });
        }
      }
      else if (params.auto) {
        createUser(db, openId, params.uuid, params.password).then((user) => {
          loginLogger(db, user, () => {
            resolve({ code: 0, msg: "ok", data: user });
          });
        }).catch((err) => {
          resolve({ code: 3, msg: "新建用户失败" });
        });
      }
      else {
        resolve({ code: 4, msg: "账号不存在" });
      }
    });
  });
};

const getUser = function (db, openId, callback) {
  db.collection("accounts")
    .where({ openId: openId || "none" })
    .get()
    .then((res) => {
      callback(res.data && res.data[0] || null);
    })
    .catch((err) => {
      console.log("[error]", err.errCode, err.errMsg);
      callback(null);
    });
};

const createUser = function (db, openId, uuid, password) {
  let user = {};
  user.openId = openId;
  user.uuid = uuid;
  user.username = getRandomName();
  user.password = password;
  user.createTime = user.updateTime = Date.now();

  return new Promise((resolve, reject) => {
    db.collection("accounts")
      .add({ data: user })
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          user._id = res._id;
          resolve(user);
        }
        else {
          reject(res);
        }
      })
      .catch((error) => {
        console.log("[error]", err.errCode, err.errMsg);
        reject(err);
      });
  });
};

const loginLogger = function (db, user, callback) {
  setLastTime(db, user).then(() => {
    return setLogger(db, user);
  }).then(() => {
    callback();
  });
};

// 更新用户最后登录时间
const setLastTime = function (db, user) {
  user.lastLoginTime = Date.now();
  return db.collection("accounts").doc(user._id)
    .update({
      data: {
        lastLoginTime: user.lastLoginTime
      }
    })
    .catch((err) => {
      console.log("[error]", err.errCode, err.errMsg);
    });
};

// 记录登录日志
const setLogger = function (db, user) {
  let params = {};
  params.userId = user._id;
  params.openId = user.openId;
  params.type = "login";
  params.remark = `用户${user.username}登录`;
  params.createTime = new Date();
  return db.collection("logs")
    .add({ data: params })
    .catch((err) => {
      console.log("[error]", err.errCode, err.errMsg);
    });
};

// 获取一个随机用户名称
const getRandomName = function () {
  let s = [];
  for (let i = 0; i < 10; i++) {
    s.push(Math.ceil(Math.random() * 10));
  }
  return "sbox_" + s.join("");
};