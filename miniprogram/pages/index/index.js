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
    searchValue: '',
    isOverlayVisible: true, // 控制蒙层显示与否
    mainInfo: [],
    searchFlag: false
  },

   // 关闭蒙层
   closeOverlay() {
    this.setData({
      isOverlayVisible: false
    });
  },

  inputSearch(e){
    let searchValue = e.detail.value;
    console.log(searchValue);
    this.setData({
      searchValue: searchValue
    })
  },

  onSearch(){
    if(!Boolean(app.globalData.userInfo?.name)){
      wx.switchTab({
        url: '/pages/myinfo/myinfo',
      })
      wx.showToast({
        title: '请先登录',
        icon:'error'
      })
      return;
    }
    if(this.data.searchFlag) return;
    this.setData({
      searchFlag: true
    })
    let searchValue = this.data.searchValue;
    if(!Boolean(searchValue)){
      wx.showToast({
        title: '搜索值为空',
        icon:'error'
      })
      this.setData({
        searchFlag: false
      })
      return;
    }

    wx.navigateTo({
      url: '/pages/message/message?searchValue='+searchValue,
    })

    this.setData({
      searchValue: '',
    })
    setTimeout(()=>{
      this.setData({
        searchFlag: false
      })
    },500)

  },

  goToMessage(e){
    console.log(e);
    wx.navigateTo({
      url: '/pages/outer/outer?url='+e.currentTarget.dataset.url,
    })
  },


  handleIndex(e){
    if(!Boolean(app.globalData.userInfo?.name)){
      wx.switchTab({
        url: '/pages/myinfo/myinfo',
      })
      wx.showToast({
        title: '请先登录',
        icon:'error'
      })
      return
    }
    console.log(e.currentTarget.dataset.category);
    const category =  e.currentTarget.dataset.category;
    wx.navigateTo({
      url: '/pages/message/message?category='+category,
    })
  },

  gotoHealth(){
    if(!Boolean(app.globalData.userInfo?.name)){
      wx.switchTab({
        url: '/pages/myinfo/myinfo',
      })
      wx.showToast({
        title: '请先登录',
        icon:'error'
      })
      return
    }

    wx.navigateTo({
      url: '/pages/health/health',
    })
  },



  async getMainInfo() {
    const pageSize = 200; // 保持每次请求200条
    let allRecords = []; // 存储所有数据
    let currentPage = 1; // 当前页码
    let total = 0; // 总数据量
  
    // 先获取第一页数据并得到总条数
    const firstPage = await models.message.list({
      filter: { where: {
        isHomeShow: {
          $eq: true,
        },
      } },
      pageSize,
      pageNumber: currentPage,
      getCount: true // 第一次请求获取总数
    });
  
    // 合并第一页数据
    allRecords = firstPage.data.records;
    total = firstPage.data.total;
  
    // 计算总页数
    const totalPages = Math.ceil(total / pageSize);
  
    // 如果有多页数据，继续获取剩余页
    if (totalPages > 1) {
      // 生成剩余页码数组（从第二页开始）
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          models.message.list({
            filter: { where: {
              isHomeShow: {
                $eq: true,
              },
            } },
            pageSize,
            pageNumber: page,
            getCount: false // 后续请求不需要总数
          })
        );
      }
  
      // 并发请求所有剩余页
      const responses = await Promise.all(pagePromises);
      
      // 合并所有结果
      responses.forEach(response => {
        allRecords = allRecords.concat(response.data.records);
      });
  
     
    }
    // 更新数据
    this.setData({
      mainInfo: allRecords
    });
  
    console.log('Total records:', allRecords.length,allRecords);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMainInfo();
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