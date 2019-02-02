// src/pages/others/secret_input.js

const Crypto = require("../../utils/crypto.js");

const app = getApp();

Page({

  data: {
    password: ""
  },

  onLoad: function (options) {
    this.setData({ password: "" });
  },

  onInputHandler (e) {
    this.setData({ password: e.detail.value || "" });
  },

  onSubmitBtnHandler () {
    if (!this.data.password)
      return app.$tooltip("请输入口令");
    let user = app.userInfo || {};
    let password = Crypto.encrypt(this.data.password, user.uuid);
    if (password == user.password) {
      wx.navigateBack({});
      if (app._secretCallback) {
        app._secretCallback(this.data.password);
      }
    }
    else {
      app.$showMessage("口令错误!");
    }
  }

})