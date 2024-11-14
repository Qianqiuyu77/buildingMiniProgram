const { init } = require('@cloudbase/wx-cloud-client-sdk')
var app = getApp()
  // 指定云开发环境 ID
  wx.cloud.init({
    env: app.globalData.envParams,
  })
  const client = init(wx.cloud)
  const models = client.models
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOverlayVisible: true, // 控制蒙层显示与否
    currentIndex: 0, // 当前显示的图片索引
    images: [
      'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/OIP-C.jpg',
      'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/OIP-C.jpg',
      'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/OIP-C.jpg',
    ]
  },

   // 关闭蒙层
   closeOverlay() {
    this.setData({
      isOverlayVisible: false
    });
  },

  // 处理滑动切换图片
  onSwiperChange(e) {
    const index = e.detail.current;
    this.setData({
      currentIndex: index
    });
  },

  handleIndex(e){
    console.log(e.currentTarget.dataset.category);
    const category =  e.currentTarget.dataset.category;
    wx.navigateTo({
      url: '/pages/message/message?category='+category,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0  // 当前页面索引
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})