//app.js

wx.cloud.init();

const env = "prod"; // prod, test, dev

let userSecret = null;
let userSecretValid = false;
let userSecretTimerId = 0;

App({
  userInfo: null,

  onLaunch () {
    if (this.isDev()) {
      this.userInfo = wx.getStorageSync("userInfo");
      this.setSecret(wx.getStorageSync("userSecret"));
    }
    else {
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

  getSecret (valid) {
    return new Promise((resolve, reject) => {
      if (userSecret && userSecretValid) {
        resolve(userSecret);
      }
      else if (userSecret && !valid) {
        resolve(userSecret);
      }
      else {
        this._secretCallback = (secret) => {
          this.setSecret(secret);
          resolve(secret);
        };
        wx.navigateTo({ url: "/pages/others/secret_input" });
      }
    });
  },

  setSecret (value) {
    userSecret = value;
    userSecretValid = true;
    if (!this.isDev()) {
      if (userSecretTimerId) {
        clearTimeout(userSecretTimerId);
      }
      userSecretTimerId = setTimeout(() => {
        console.log("invalid")
        // userSecret = "";
        userSecretValid = false;
        userSecretTimerId = 0;
      }, 5 * 60 * 1000);
    }
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
    if (typeof message != "string") {
      message = message.msg || JSON.stringify(message);
    }
    wx.showModal({
      title: title || "温馨提示",
      content: message,
      showCancel: false,
      confirmText: "知道了",
      confirmColor: "#7BB5D1"
    })
  },

  $tooltip (message, duration) {
    wx.showToast({
      title: message,
      icon: "none",
      duration: (duration || 3000)
    });
  }

})