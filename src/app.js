//app.js

wx.cloud.init();

const env = "dev"; // prod, test, dev

App({
  userInfo: null,
  userSecret: null,

  onLaunch () {
    if (this.isDev()) {
      this.userInfo = wx.getStorageSync("userInfo");
      this.userSecret = wx.getStorageSync("userSecret");
    }
    else if (this.isTest()) {
      wx.removeStorageSync("userInfo");
      wx.removeStorageSync("userSecret");
    }
  },

  isDev () {
    return env == "dev";
  },

  isTest () {
    return env == "test";
  },

  isProduction () {
    return env == "prod";
  },

  cloudFunction (name, data, callback) {
    if (typeof callback != "function")
      callback = () => {};
    wx.cloud.callFunction({ name: name, data: {data: data} })
      .then((res) => {
        if (/ok/.test(res.errMsg)) {
          let result = res.result;
          if (result && result.code !== 0) {
            if (callback((result.msg || "error"), result) !== false) {
              this.$showMessage((result.msg || result), "出错了");
            }
          }
          else {
            callback(false, (result && result.data));
          }
        }
        else if (callback(res) !== false) {
          this.$showMessage((res.errMsg || res), "出错了");
        }
      })
      .catch((err) => {
        if (callback(err) !== false) {
          this.$showMessage((err.errMsg || err), "出错了");
        }
      });
  },

  $showMessage (message, title) {
    wx.showModal({
      title: title || "温馨提示",
      content: message,
      showCancel: false,
      confirmText: "知道了"
    })
  }

})