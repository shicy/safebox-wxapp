// src/pages/edit/edit.js

const Crypto = require("../../utils/crypto.js");

const app = getApp();

Page({
  currentItem: null,

  data: {
    title: "",
    content: ""
  },

  onLoad: function (options) {
    this.currentItem = wx.getStorageSync("data_for_edit") || {};
    wx.removeStorageSync("data_for_edit");

    let _data = { title: "", content: "" };
    if (this.currentItem && this.currentItem._id) {
      app.getSecret(true).then((secret) => {
        if (this.currentItem.title) {
          _data.title = Crypto.decrypt(secret, this.currentItem.title);
        }
        if (this.currentItem.content) {
          _data.content = Crypto.decrypt(secret, this.currentItem.content);
        }
        this.setData(_data);
      });
    }
    else {
      this.setData(_data);
    }
  },

  onTitleInputHandler (e) {
    this.setData({ title: e.detail.value || "" });
  },

  onContentInputHandler (e) {
    this.setData({ content: e.detail.value || "" });
  },

  onSubmitBtnHandler (e) {
    let params = {};
    params.title = this.data.title.trim();
    params.content = this.data.content.trim();

    if (!params.title)
      return app.$tooltip("请输入标题");
    if (!params.content)
      return app.$tooltip("请输入内容");
    
    app.getSecret(true).then((secret) => {
      if (this.currentItem._id)
        params._id = this.currentItem._id;
      params.groupId = this.currentItem.groupId;
      params.title = Crypto.encrypt(secret, params.title);
      params.content = Crypto.encrypt(secret, params.content);

      wx.showLoading({ title: "正在提交...", mask: true });
      app.cloudFunction("saveItem", params, (err, ret) => {
        wx.hideLoading();
        if (!err) {
          wx.showToast({ title: "保存成功", duration: 1500 });
          wx.setStorageSync("page_edit_saved", "1");
          setTimeout(() => {
            wx.navigateBack({});
          }, 1500);
        }
      });
    });
  }

})