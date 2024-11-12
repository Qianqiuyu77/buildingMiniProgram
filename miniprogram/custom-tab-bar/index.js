Component({
  data: {
    selected: 0,  // 当前选中页面索引
    color: "#A2A9B0",  // 未选中颜色
    selectedColor: "#1fdbae",  // 选中颜色
    list: [
      {
        pagePath: "/pages/index/index",
        iconPath: "/images/1.png",
        selectedIconPath: "/images/1.png",
        text: "首页"
      },
      {
        pagePath: "/pages/design/design",
        iconPath: "/images/2.png",
        selectedIconPath: "/images/2.png",
        text: "设计"
      },
      {
        pagePath: "/pages/square/square",
        iconPath: "/images/3.png",
        selectedIconPath: "/images/3.png",
        text: "广场"
      },
      {
        pagePath: "/pages/myinfo/myinfo",
        iconPath: "/images/4.png",
        selectedIconPath: "/images/4.png",
        text: "我的"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index
      });
    }
  }
});
