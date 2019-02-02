// src/pages/detail/detail.js

const app = getApp();

Page({

  data: {
    models: [],
    loadingFlag: false
  },

  onLoad (options) {
    this.refresh();
    if (options.name) {
      wx.setNavigationBarTitle({
        title: options.name
      });
    }
  },

  onShow () {
    if (wx.getStorageSync("page_edit_saved")) {
      wx.removeStorageSync("page_edit_saved");
      this.refresh();
    }
  },

  onAddBtnHandler () {
    app.getSecret(true).then(() => {
      wx.setStorageSync("data_for_edit", { groupId: this.options.id });
      wx.navigateTo({ url: "/pages/edit/edit" });
    });
  },

  onItemEditHandler (e) {
    let data = e.detail;
    app.getSecret(true).then(() => {
      wx.setStorageSync("data_for_edit", data);
      wx.navigateTo({ url: "/pages/edit/edit" });
    });
  },

  onItemDeleteHandler (e) {
    this.refresh();
  },

  refresh (callback) {
    let params = {};
    params.groupId = this.options.id;

    this.setData({ models: [], loadingFlag: true });

    wx.showLoading({ title: "正在努力加载", mask: true });
    app.cloudFunction("listItem", params, (err, ret) => {
      wx.hideLoading();
      if (!err && ret) {
        app.getSecret().then(() => {
          let models = this.data.models || [];
          models = ret.map(this.formatData);
          this.setData({ models: models, loadingFlag: false });
        });
      }
      if (callback) {
        callback(err);
      }
    });
  },

  formatData (data) {
    return data;
  }

})