//app.js

App({
  wxopenId: null,

  onLaunch: function () {
    wx.cloud.init();
    // this.getWxOpenId((openId) => {
    //   console.log(openId)
    // });
  },

  getWxOpenId: function (callback) {
    if (this.wxopenId) {
      if (callback)
        callback(this.wxopenId);
    }
    else {
      wx.cloud.callFunction({
        name: "getOpenId",
        success: function (res) {
          this.wxopenId = res && res.result;
          if (callback)
            callback(this.wxopenId);
        },
        fail: function (err) {
          if (callback)
            callback(null);
        }
      });
    }
  }
})