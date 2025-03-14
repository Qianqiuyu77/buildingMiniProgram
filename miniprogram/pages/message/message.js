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
    mainInfo:[],
    favouriteInfo: [],
    category: '',
    showStars: false, // 控制星星动画
    stars: [], // 存放星星的位置
  },
  async onFavouriteClick(e) {
    let messageId = e.currentTarget.dataset.messageid;
    let index = e.currentTarget.dataset.index;
    let userId = app.globalData?.userInfo?.openid || ""

    let isFavourite = "mainInfo["+index+"].isFavourite"


    if(this.data.mainInfo[index].showStars) return;

    if (!this.data.mainInfo[index].isFavourite) {
      this.generateStars(index);
      this.setData({
        [isFavourite]:true
      })
      await this.favouriteMessage(messageId,userId);
    }else{
      this.setData({
        [isFavourite]:false
      })
      await this.cancelFavourite(messageId,userId)
    }
  },

  async getFavouriteData() {
   const pageSize = 200; // 保持每次请求200条
  let allRecords = []; // 存储所有数据
  let currentPage = 1; // 当前页码
  let total = 0; // 总数据量

  // 先获取第一页数据并得到总条数
  const firstPage = await models.favourite.list({
    filter: { where: {} },
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
          filter: { where: {} },
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

  console.log('Total favouriteInfo:', allRecords.length,allRecords);
  },

  async favouriteMessage(messageId,userId) {
     await models.favourite.create({
      data: {
        messageId,  // messageId
        userId,  // userId
      },
      envType: "pre",
    });
    

  },
  async cancelFavourite(messageId,userId) {

    const { data } = await models.favourite.delete({
      filter: {
        where: {
          $and: [
            { userId: { $eq: userId } },
            { messageId: { $eq: messageId } }
          ]
        }
      },
      envType: "pre", // 体验环境
    });
  
  },
    

  generateStars(index) {
    let showStars = "mainInfo["+index+"].showStars";
    const positions = [
      { top: -40, left: -20, delay: 0 },
      { top: -40, left: 20, delay: 0.1 },
      { top: -20, left: -40, delay: 0.2 },
      { top: -20, left: 40, delay: 0.3 },
      { top: 0, left: -50, delay: 0.4 }
    ];

    this.setData({ [showStars]: true,
       stars: positions });

    setTimeout(() => {
      this.setData({ [showStars]: false });
    }, 600); // 动画结束后隐藏
  }
,
async getMainInfo() {
  const pageSize = 200; // 保持每次请求200条
  let allRecords = []; // 存储所有数据
  let currentPage = 1; // 当前页码
  let total = 0; // 总数据量
  let category = this.data.category

  // 先获取第一页数据并得到总条数
  const firstPage = await models.message.list({
    filter: { where: {
      category: {
        $eq: category,
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
            category: {
              $eq: category,
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
  allRecords.forEach(item=>{
    item.isFavourite =this.messageIsFav(item._id)
    item.showStars = false
  })
  // 更新数据
  this.setData({
    mainInfo: allRecords
  });

  console.log('Total records:', allRecords.length,allRecords);
},

  messageIsFav (messageId){
    let userId = app.currentTarget?.userInfo?.openid || "o6Zra4pytaFh5-KIAXyNb9p9nDwA" 
    let favouriteInfo = this.data.favouriteInfo;
    return Boolean(favouriteInfo.find(item=>{
     return item.messageId === messageId && item.userId === userId
    })) 
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
  onLoad: async  function (options) {
    this.setData(
      {
        category: options.category
      }
    )

    await this.getFavouriteData()
    await this.getMainInfo()
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