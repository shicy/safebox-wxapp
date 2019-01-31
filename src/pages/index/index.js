//index.js

const Crypto = require("../../utils/crypto.js");

const app = getApp()

Page({
  currentGroup: null,
  currentEdit: null,

  data: {
    models: [],
    showAddBtns: false,
    nameEditorVisible: false,
    nameEditorTitle: "",
    nameEditorValue: ""
  },

  onLoad (options) {
    console.log("=====>", options)
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
      this.doSave(Object.assign({ pid: "" }, this.currentEdit, { name: name }));
    }
  },

  showEditor (data) {
    this.currentEdit = data;
    this.setData({
      showAddBtns: false,
      nameEditorVisible: true,
      nameEditorTitle: (data.type == 1 ? "请输入分组名称" : "请输入名称"),
      nameEditorValue: ""
    });
  },

  doSave (model) {
    model.name = Crypto.encrypt(app.userSecret, model.name);
    wx.showLoading({ title: "请稍等..", mask: true });
    app.cloudFunction("saveGroup", model, (err, ret) => {
      console.log("0000", err, ret);
      wx.hideLoading();
    });
  }
})
