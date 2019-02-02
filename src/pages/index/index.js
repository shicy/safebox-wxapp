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

  // ============================================
  showEditor (data) {
    this.currentEdit = data;
    this.setData({
      showAddBtns: false,
      nameEditorVisible: true,
      nameEditorTitle: (data.type == 1 ? "请输入分组名称" : "请输入名称"),
      nameEditorValue: ""
    });
  },

  refresh (callback) {
    let params = {};
    params.pid = this.currentGroupId;

    this.setData({ models: [], loadingFlag: true });

    wx.showLoading({ title: "正在努力加载", mask: true });
    app.cloudFunction("listGroup", params, (err, ret) => {
      console.log("=====>", err, ret);
      wx.hideLoading();
      if (!err && ret) {
        let models = this.data.models || [];
        models = ret.map(this.formatData);
        models.sort((a, b) => {
          if (a.type != b.type)
            return b.type - a.type;
          if (a.name != b.name)
            return a.name < b.name ? -1 : 1;
          return 0;
        });
        this.setData({ models: models, loadingFlag: false });
      }
      if (callback) {
        callback(err);
      }
    });
  },

  doSave (model) {
    model.name = Crypto.encrypt(app.userSecret, model.name);
    wx.showLoading({ title: "请稍等..", mask: true });
    app.cloudFunction("saveGroup", model, (err, ret) => {
      // console.log("saved", err, ret);
      wx.hideLoading();
      this.refresh();
    });
  },

  formatData (data) {
    data.name = Crypto.decrypt(app.userSecret, data.name);
    return data;
  }

})
