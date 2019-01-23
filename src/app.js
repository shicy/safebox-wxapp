//app.js

wx.cloud.init();

App({
  userInfo: null,
  userSecret: null,

  onLaunch () {
  },

  cloudFunction (name, data, callback) {
    if (typeof callback != "function")
      callback = () => {};
    wx.cloud.callFunction({ name: name, data: data })
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          callback(false, res.result);
        }
        else if (callback(res) !== false) {
          wx.showModal({
            title: "出错了",
            content: (res.errMsg || res)
          });
        }
      })
      .catch((err) => {
        if (callback(err) !== false) {
          wx.showModal({
            title: "出错了",
            content: (err.errMsg || err)
          });
        }
      });
  }

})