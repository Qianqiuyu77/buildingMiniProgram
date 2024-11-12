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
    searchValue:'',
    newsUrl:'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg',
    hotsInfo:[{
      url:'1'
    },{
      url:'2'
    },{
      url:'3'
    },{
      url:'4'
    },{
      url:'4'
    },{
      url:'4'
    }],
    mainInfo:[]
  },
  async getMainInfo(){
    const { data } = await models.message.list({
      filter: {
        where: {}
      },
      pageSize: 10, // 分页大小，建议指定，如需设置为其它值，需要和 pageNumber 配合使用，两者同时指定才会生效
      pageNumber: 1, // 第几页
      getCount: true, // 开启用来获取总数
    });
    this.setData({
      mainInfo:data.records
    })
  
    // 返回查询到的数据列表 records 和 总数 total
    console.log(data);
    // {
    //   "records": [{...},{...}],
    //   "total": 51
    // }
  },
  goToMessage(e){
    console.log(e.currentTarget.dataset.url);
    wx.navigateTo({
      url: '/pages/outer/outer?url='+e.currentTarget.dataset.url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMainInfo()
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