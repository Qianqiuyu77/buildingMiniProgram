// pages/index/index.js
const app=getApp()
const { init } = require('@cloudbase/wx-cloud-client-sdk')
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
    active: 0,
    activeList: [1,2,3,4,5,6,7],
    Nowtagname:"",
    searchflag:false,
    testImg: 'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg',
    plArr: [],
  },
  async getPlArr() {
    let allRecords = []; // 存储所有获取到的数据
    let currentPage = 1; // 从第一页开始
    
    while (true) {
      const { data } = await models.plBox.list({
        filter: {
          where: {}
        },
        pageSize: 10, // 每次请求的记录数
        pageNumber: currentPage, // 当前页
        getCount: true, // 获取总数
      });
  
      // 如果没有数据，退出循环
      if (data.records.length === 0) break;
  
      // 对获取的数据进行处理
      let updatedArray = data.records.map(obj => ({
        ...obj, // 展开当前对象以保留所有现有属性  
        comment: '' // 添加新的属性
      }));
  
      // 合并当前页数据
      allRecords = [...allRecords, ...updatedArray];
      
      // 页数递增，继续请求下一页
      currentPage++;
    }
    allRecords.sort((a, b) => b.createdAt - a.createdAt);
    // 更新数据状态
    this.setData({
      plArr: allRecords, // 设置所有数据
    });
  
    console.log(allRecords); // 输出所有数据
    console.log(this.data.plArr); // 输出已更新的 plArr
  },
  bindKeyInput(e){
    console.log(e);
    var index = e.currentTarget.dataset.index;
    var checked = "plArr["+index+"].comment";
    this.setData({
      [checked]:e.detail.value})
      console.log(this.data.plArr);
},
async send(e){
  if(Boolean(app.globalData.userInfo?.name)){
    const index= e.currentTarget.dataset.index
  const plItem = this.data.plArr[index];
  const plInfo = {
    plTime: this.getCurrentDateFormatted(),
    plName: app.globalData.userInfo.name,
    plContent: plItem.comment,
    plImg: app.globalData.userInfo.avatUrl
  };
  console.log(plItem);
  plItem.plArr.push(plInfo);
  const { data } = await models.plBox.update({
    data: {
        plArr: plItem.plArr,  // 评论
      },
    filter: {
      where: {
        $and: [
          {
            _id: {
              $eq: plItem._id, // 推荐传入_id数据标识进行操作
            },
          },
        ]
      }
    },
  });
  console.log(data);
  var checked = "plArr["+index+"]";
  var checkedCommit = "plArr["+index+"].comment";
  this.setData({
    [checked]:plItem,
    [checkedCommit]: "" })
    console.log(this.data.plArr);
  // 返回更新成功的条数
  // { count: 1}
  }else{
    wx.switchTab({
      url: '/pages/myinfo/myinfo',
    })
    wx.showToast({
      title: '请先登录',
      icon:'error'
    })
  }
  
},

 async changeLove(e){
  const index = e.currentTarget.dataset.index;
  const love = e.currentTarget.dataset.love;
  var checkedCommit = "plArr["+index+"].loveFlag";
  this.setData({
    [checkedCommit]: !love 
  })

  const plItem = this.data.plArr[index];
  await models.plBox.update({
    data: {
        loveFlag: !love ,  // 评论
      },
    filter: {
      where: {
        $and: [
          {
            _id: {
              $eq: plItem._id, // 推荐传入_id数据标识进行操作
            },
          },
        ]
      }
    },
  });
},
getCurrentDateFormatted() {  
  // 创建一个Date对象表示当前时间  
  const now = new Date();  

  // 获取年、月、日
  const year = now.getFullYear();  
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 填充为两位数  
  const day = String(now.getDate()).padStart(2, '0'); // 填充为两位数  

  // 获取小时和分钟
  const hours = String(now.getHours()).padStart(2, '0'); // 填充为两位数  
  const minutes = String(now.getMinutes()).padStart(2, '0'); // 填充为两位数  

  // 使用模板字符串格式化日期和时间，中间用空格分隔
  return `${year}-${month}-${day} ${hours}:${minutes}`;  
}
,
gotoSendSquare(){
  if(Boolean(app.globalData.userInfo?.name)){
    wx.navigateTo({
      url: '/pages/sendSquare/sendSquare',
    })
  }else{
    wx.switchTab({
      url: '/pages/myinfo/myinfo',
    })
    wx.showToast({
      title: '请先登录',
      icon:'error'
    })
  }

},
  async onLoad(options) {
    await this.getPlArr();
    
    // 返回查询到的数据列表 records 和 总数 total
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2  // 当前页面索引
      });
    }
    console.log(app.globalData);
    await this.getPlArr();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})