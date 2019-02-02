// pages/auth/login/login.js

const Utils = require("../../../utils/util.js");
const Crypto = require("../../../utils/crypto.js");

const app = getApp();

Page({
  uuid: "",
  password: "",

  data: {
    seepwd: false,
    isFirstLogin: false,
    confirmText: "",
    confirmDialogVisible: false
  },

  onLoad () {
    if (app.isDev() && app.userInfo) {
      wx.redirectTo({ url: "/pages/index/index" });
    }
    else {
      this.initUserInfo().then((uuid) => {
        this.setData({ isFirstLogin: !uuid });
      });
    }
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
        this.setData({ confirmText: "", confirmDialogVisible: true });
      }
      else {
        this.doLogin();
      }
    }
  },

  // 用户2次确认口令
  onConfirmHandler (e) {
    e.detail.preventDefault = true;
    if (!e.detail.value) {
      app.$tooltip("请再次输入口令");
    }
    else if (this.password != e.detail.value) {
      app.$tooltip("2次输入的口令不一致");
    }
    else {
      e.detail.preventDefault = false;
      this.setData({ confirmText: e.detail.value });
      this.doLogin();
    }
  },

  doLogin () {
    let params = {};
    params.uuid = this.uuid || Utils.randomText(16);
    params.password = Crypto.encrypt(this.password, params.uuid);
    params.auto = true;
    wx.showLoading({ title: "正在登录...", mask: true });
    app.cloudFunction("login", params, (err, ret) => {
      wx.hideLoading();
      if (!err) {
        this.loginSuccessed(ret);
      }
      else if (ret.code == 2) {
        app.$showMessage("口令不正确", "登录失败");
        return false;
      }
    });
  },

  loginSuccessed (user) {
    app.userInfo = user;
    app.setSecret(this.password);
    if (!app.isProduction()) {
      wx.setStorageSync("userInfo", user);
      wx.setStorageSync("userSecret", this.password);
    }
    wx.redirectTo({ url: "/pages/index/index" });
  },

  checkPassword () {
    if (!this.password)
      return app.$tooltip("请输入口令");
    if (this.data.isFirstLogin) {
      if (this.password.length < 8)
        return app.$tooltip("口令必须是8个字及以上");
      if (this.password.length > 16)
        return app.$tooltip("");
      // if (!(/[a-zA-Z]/.test(this.password)))
      //   return app.$tooltip("口令必须包含字母和数字");
      // if (!(/\d/.test(this.password)))
      //   return app.$tooltip("口令必须包含字母和数字");
    }
    return true;
  },

  initUserInfo() {
    return new Promise((resolve, reject) => {
      app.cloudFunction("uuid", null, (err, ret) => {
        let uuid = this.uuid = (!err ? ret : null);
        resolve(uuid);
        return false;
      });
    });
  }
  
})