// pages/auth/login/login.js

const app = getApp();

Page({
  password: "",

  data: {
    seepwd: false,
    isFirstLogin: false
  },

  onLoad () {
    this.initUserInfo().then((account) => {
      this.setData({ isFirstLogin: !account });
    });
  },

  // 用户输入口令
  onInputHandler (e) {
    this.password = e.detail.value;
  },

  // 显示或隐藏口令
  onEyeBtnHandler (e) {
    this.setData({ seepwd: !this.data.seepwd });
  },

  // 点击登录按钮
  onLoginBtnHandler (e) {
    if (this.checkPassword()) {
      if (this.data.isFirstLogin) {
        
      }
    }
  },

  checkPassword () {
    if (!this.password)
      return this.showError("请输入口令");
    if (this.data.isFirstLogin) {
      if (this.password.length < 8)
        return this.showError("口令必须是8个字及以上");
      // if (!(/[a-zA-Z]/.test(this.password)))
      //   return this.showError("口令必须包含字母和数字");
      // if (!(/\d/.test(this.password)))
      //   return this.showError("口令必须包含字母和数字");
    }
    return true;
  },

  initUserInfo() {
    app.userInfo = null;
    return new Promise((resolve, reject) => {
      app.cloudFunction("accountInfo", null, (err, ret) => {
        app.userInfo = !err ? ret : null;
        resolve(app.userInfo);
        return false;
      });
    });
  },

  showError (errmsg) {
    wx.showToast({
      title: errmsg,
      icon: "none",
      duration: 3000
    });
  }

})