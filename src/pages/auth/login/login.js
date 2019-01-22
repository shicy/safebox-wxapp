// pages/auth/login/login.js
Page({
  password: "",

  data: {
    seepwd: false,
    isFirstLogin: true
  },

  onLoad () {
    
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

  }


})