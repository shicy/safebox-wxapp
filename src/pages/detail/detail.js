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
    console.log("onShow")
  },

  onAddBtnHandler () {
    wx.setStorageSync("data_for_edit", {groupId: this.options.id});
    wx.navigateTo({
      url: "/pages/edit/edit"
    });
  },

  refresh (callback) {
    let params = {};
    params.groupId = this.options.id;

    this.setData({ models: [], loadingFlag: true });

    wx.showLoading({ title: "正在努力加载", mask: true });
    app.cloudFunction("listItem", params, (err, ret) => {
      wx.hideLoading();
      if (!err && ret) {
        let models = this.data.models || [];
        models = ret.map(this.formatData);
        this.setData({ models: models, loadingFlag: false });
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