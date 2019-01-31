// components/dialog/InputDialog.js
Component({

  properties: {
    show: {
      type: "Boolean",
      value: false,
      observer: function (newval) {
        if (newval) {
          this.setData({ focus: true });
        }
      }
    },
    title: {
      type: "String",
      value: "标题",
      observer: function (newval, oldval) {
      }
    },
    label: {
      type: "String",
      value: ""
    },
    placeholder: {
      type: "String",
      value: "点击输入"
    },
    value: {
      type: "String",
      value: "",
      observer: function (newval) {
        this.setData({ text: newval || "" });
      }
    },
    showAsPassword: {
      type: "Boolean",
      value: false
    }
  },

  data: {
    text: "",
    focus: false
  },

  lifetimes: {
    attached () {
      this.setData({ text: this.data.value });
    }
  },

  methods: {
    onInputHandler (e) {
      this.setData({ text: e.detail.value });
    },

    onSubmitHandler () {
      let myEventDetail = { value: this.data.text };
      this.triggerEvent("submit", myEventDetail);
      if (!myEventDetail.preventDefault)
        this.setData({ show: false, value: "", text: "" });
    },

    onCancelHandler () {
      this.triggerEvent("cancel");
      this.setData({ show: false, value: "", text: "" });
    }
  }
})
