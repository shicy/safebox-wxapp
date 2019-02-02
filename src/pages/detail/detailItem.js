// pages/detail/detailItem.js

const Crypto = require("../../utils/crypto.js");

const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    model: {
      type: "Object",
      observer: function (newval) {
        this.initData(newval || {});
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: "",
    content: "",
    richContent: null,
    lockflag: true,
    lockTime: 0
  },

  lifetimes: {
    attached () {
      this.initData(this.data.model || {});
    },
    detached () {
      if (this.lockTimerId) {
        clearInterval(this.lockTimerId);
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData (data) {
      app.getSecret().then((secret) => {
        let _data = {};
        _data.title = Crypto.decrypt(secret, data.title);
        _data.content = data.content;
        this.setData(_data);
      });
    },

    onLockTapHandler () {
      app.getSecret(true).then((secret) => {
        let times = 30;
        if (this.data.richContent) {
          this.setData({ lockflag: false, lockTime: times });
        }
        else {
          let data = this.data.model || {}; console.log(data._id)
          let content = Crypto.decrypt(secret, data.content);
          content = content.split("\n");
          content = content.map((temp) => {
            return { name: "div", children: [{ type: "text", text: temp }] };
          });
          this.setData({ richContent: content, lockflag: false, lockTime: times });
        }

        this.lockTimerId = setInterval(() => {
          times -= 1;
          if (times <= 0) {
            clearInterval(this.lockTimerId);
            this.lockTimerId = 0;
            this.setData({ lockflag: true, lockTime: 0 });
          }
          else {
            this.setData({ lockTime: times });
          }
        }, 1000);
      });
    },

    onMoreBtnHandler () {
      wx.showActionSheet({
        itemList: ["修改", "删除"],
        success: (res) => {
          if (res.tapIndex == 0) {
            this.doUpdate();
          }
          else if (res.tapIndex == 1) {
            this.doDelete();
          }
        }
      });
    },

    doUpdate () {
      this.triggerEvent("edit", this.data.model);
    },

    doDelete () {
      wx.showModal({
        title: "警告",
        content: "是否确认删除？",
        success: (res) => {
          if (res.confirm) {
            app.getSecret(true).then(() => {
              let params = { id: this.data.model._id };
              wx.showLoading({ title: "正在删除...", mask: true });
              app.cloudFunction("removeItem", params, (err, ret) => {
                wx.hideLoading();
                if (!err) {
                  wx.showToast({ title: "删除成功", duration: 1500 });
                  setTimeout(() => {
                    this.triggerEvent("deleted", this.data.model);
                  }, 1500);
                }
              });
            });
          }
        }
      });
    }
  }
})
