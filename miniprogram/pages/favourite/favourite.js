const {
  init
} = require('@cloudbase/wx-cloud-client-sdk')
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

    favouriteInfo: [],
    mainInfo: [],
    userId: app.currentTarget?.userInfo?.openid || 'o6Zra4pytaFh5-KIAXyNb9p9nDwA',
    searchValue: '',
    searchFlag: false,
    currentKey: 1,
    category: '推荐',
    navConfig:[
      {
        index: 1,
        title: '推荐'
      },
      {
        index: 2,
        title: '科普'
      },
      {
        index: 3,
        title: '案例'
      },
      {
        index: 4,
        title: '产品'
      },
      {
        index: 5,
        title: '商家'
      },
    ]

  },
  selectKey(e){
    let index = e.currentTarget.dataset.index;
    let navConfig = this.data.navConfig;
    let currentCategory =  navConfig[index - 1];
    this.setData({
      currentKey: e.currentTarget.dataset.index,
      category: currentCategory.title
    })
    
  },
  inputSearch(e){
    let searchValue = e.detail.value;
    console.log(searchValue);
    this.setData({
      searchValue: searchValue
    })
  },
  async resetSearch(){
    await this.getData()
  },
  async onSearch(){
    if(this.data.searchFlag)
    return;
    this.setData({
      searchFlag: true
    })
    if(!this.data.searchValue){
      wx.showToast({
        title: "搜索内容为空!",
        icon: "error",
      });
      setTimeout(()=> this.setData({
      searchFlag: false
    }),500)
      return;
    }
    await this.getData()
    this.setData({
      searchValue: ''
    })
    setTimeout(()=> this.setData({
      searchFlag: false
    }),500)
  },

  async getFavouriteData(userId) {
    const pageSize = 200; // 保持每次请求200条
    let allRecords = []; // 存储所有数据
    let currentPage = 1; // 当前页码
    let total = 0; // 总数据量

    // 先获取第一页数据并得到总条数
    const firstPage = await models.favourite.list({
      filter: {
        where: {
          userId: {
            $eq: userId,
          },
        }
      },
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
          models.favourite.list({
            filter: {
              where: {}
            },
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
      favouriteInfo: allRecords
    });

    console.log('Total favouriteInfo:', allRecords.length, allRecords);
  },
  getSearchInfo(mainInfo, searchValue) {

    if (!searchValue) {
        return mainInfo; // 如果 searchValue 为空，返回所有数据
    }
  
    mainInfo = mainInfo.filter(item => {
        return item.title && item.title.includes(searchValue);
    });
  
    return mainInfo; // 返回匹配的数组
  },
  async getMainInfo() {
    const pageSize = 200; // 保持每次请求200条
    let allRecords = []; // 存储所有数据
    let currentPage = 1; // 当前页码
    let total = 0; // 总数据量
    let favouriteInfo = this.data.favouriteInfo;
    let searchValue = this.data.searchValue;
    // 先获取第一页数据并得到总条数
    const firstPage = await models.message.list({
      filter: {
        where: {

        }
      },
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
            filter: {
              where: {

              }
            },
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
    allRecords = allRecords.filter(item => {
      return favouriteInfo.find(fav => fav.messageId === item._id)
    })
    if (searchValue) {
      allRecords = this.getSearchInfo(allRecords, searchValue);
    }
    // 更新数据
    this.setData({
      mainInfo: allRecords
    });

    console.log('Total records:', allRecords.length, allRecords);
  },

  async cancelFavourite(e) {
    wx.showModal({
      title: "确认取消收藏",
      content: "你确定要取消收藏吗？",
      success: async (res) => {
        if (res.confirm) {
          let messageId = e.currentTarget.dataset.messageid;
          let index = e.currentTarget.dataset.index;
          let mainInfo = this.data.mainInfo; // 获取当前的 mainInfo 数组
          console.log(messageId);
          mainInfo.splice(index, 1); // 删除 index 位置的元素

          this.setData({
            mainInfo
          }); // 更新页面数据
           await models.favourite.delete({
            filter: {
              where: {
                $and: [{
                    userId: {
                      $eq: this.data.userId
                    }
                  },
                  {
                    messageId: {
                      $eq: messageId
                    }
                  }
                ]
              }
            },
            envType: "pre", // 体验环境
          });

          wx.showToast({
            title: "已取消收藏",
            icon: "success",
          });
        }
      },
    });
  },

  goToMessage(e) {
    console.log(e.currentTarget.dataset.url);
    wx.navigateTo({
      url: '/pages/outer/outer?url=' + e.currentTarget.dataset.url,
    })
  },
  async getData(){
    await this.getFavouriteData()
    await this.getMainInfo()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await this.getData()
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