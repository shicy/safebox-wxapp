//index.js

const Utils = require("../../utils/util.js");
const Crypto = require("../../utils/crypto.js");

const app = getApp()

Page({
  currentGroupId: "0",
  currentEdit: null,

  data: {
    models: [],
    loadingFlag: false,

    showAddBtns: false,
    nameEditorVisible: false,
    nameEditorTitle: "",
    nameEditorValue: ""
  },

  // ============================================
  onLoad (options) {
    this.currentGroupId = options.id || "0";

    this.refresh();

    if (options.name) {
      wx.setNavigationBarTitle({
        title: options.name
      });
    }
  },

  onPullDownRefresh () {
    this.refresh(() => {
      wx.stopPullDownRefresh();
    });
  },

  onViewTapHandler () {
    if (this.data.showAddBtns)
      this.setData({ showAddBtns: false });
  },

  onAddBtnHandler () {
    this.setData({ showAddBtns: true });
  },

  onAddGroupBtnHandler () {
    this.showEditor({type: 1});
  },

  onAddItemBtnHandler () {
    this.showEditor({type: 0});
  },

  onEditSubmitHandler (e) {
    e.detail.preventDefault = true;
    let name = e.detail.value && e.detail.value.trim();
    if (!name) {
      app.$tooltip("请输入名称");
    }
    else {
      e.detail.preventDefault = false;
      this.doSave(Object.assign({}, this.currentEdit, 
        { pid: this.currentGroupId, name: name }));
    }
  },

  onItemTapHandler (e) {
    let data = e.currentTarget.dataset.v;
    let params = { id: data._id, name: data.name };
    if (data.type == 1) {
      wx.navigateTo({
        url: "/pages/index/index?" + Utils.queryString(params)
      });
    }
    else {
      wx.navigateTo({
        url: "/pages/detail/detail?" + Utils.queryString(params)
      });
    }
  },

  onMoreBtnHandler (e) {
    let data = e.currentTarget.dataset.v;
    wx.showActionSheet({
      itemList: ["修改名称", "删除"],
      complete: (res) => {
        if (res.tapIndex == 0) {
          this.doUpate(data);
        }
        else if (res.tapIndex == 1) {
          this.doDelete(data);
        }
      }
    });
  },

  // ============================================
  showEditor (data) {
    this.currentEdit = data;
    app.getSecret(true).then((secret) => {
      this.setData({
        showAddBtns: false,
        nameEditorVisible: true,
        nameEditorTitle: (data.type == 1 ? "请输入分组名称" : "请输入名称"),
        nameEditorValue: (this.currentEdit && this.currentEdit.name || "")
      });
    });
  },

  refresh (callback) {
    let params = {};
    params.pid = this.currentGroupId;

    this.setData({ models: [], loadingFlag: true });

    wx.showLoading({ title: "正在努力加载", mask: true });
    app.cloudFunction("listGroup", params, (err, ret) => {
      // console.log("=====>", err, ret);
      wx.hideLoading();
      if (!err && ret) {
        app.getSecret().then((secret) => {
          let models = this.data.models || [];
          models = ret.map((temp) => {
            return this.formatData(temp, secret);
          });
          models.sort((a, b) => {
            if (a.type != b.type)
              return b.type - a.type;
            if (a.name != b.name)
              return a.name < b.name ? -1 : 1;
            return 0;
          });
          this.setData({ models: models, loadingFlag: false });
        });
      }
      if (callback) {
        callback(err);
      }
    });
  },

  doSave (model) {
    app.getSecret(true).then((secret) => {
      model.name = Crypto.encrypt(secret, model.name);
      wx.showLoading({ title: "请稍等..", mask: true });
      app.cloudFunction("saveGroup", model, (err, ret) => {
        // console.log("saved", err, ret);
        wx.hideLoading();
        this.refresh();
      });
    });
  },

  doUpate (model) {
    app.getSecret(true).then(() => {
      this.showEditor(model);
    });
  },

  doDelete (model) {
    wx.showModal({
      title: "警告",
      content: "是否确定删除？",
      success: (res) => {
        if (res.confirm) {
          app.getSecret(true).then(() => {
            let params = { id: model._id };
            wx.showLoading({ title: "正在删除...", mask: true });
            app.cloudFunction("removeGroup", params, (err, ret) => {
              wx.hideLoading();
              if (!err) {
                wx.showToast({ title: "删除成功", duration: 1500 });
                setTimeout(() => {
                  this.refresh();
                }, 1500);
              }
            });
          });
        }
      }
    })
  },

  formatData (data, secret) {
    data.name = Crypto.decrypt(secret, data.name);
    return data;
  }

})
