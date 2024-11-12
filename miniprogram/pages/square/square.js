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
  async getPlArr(){
    const { data } = await models.plBox.list({
      filter: {
        where: {}
      }
    });
    let updatedArray = data.records.map(obj => ({  
      ...obj, // 展开当前对象以保留所有现有属性  
      comment: '' // 添加新的属性  
    }));  

    console.log(updatedArray);
    this.setData({
      plArr:updatedArray
    })
    console.log(this.data.plArr);
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
        img: plItem.img,  // 图片
        authorInfo: plItem.authorInfo,  // authorInfo
        authorImg: plItem.authorImg,  // authorImg
        authorName: plItem.authorName,  // authorName
        plArr: plItem.plArr,  // 评论
        authorTime: "文本",  // authorTime
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
},
 getCurrentDateFormatted() {  
  // 创建一个Date对象表示当前时间  
  const now = new Date();  
  
  // 获取年、月、日  
  // 注意：getMonth()返回的月份是从0开始的，所以要加1  
  // getDate()和getFullYear()直接返回我们需要的值  
  const year = now.getFullYear();  
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 填充为两位数  
  const day = String(now.getDate()).padStart(2, '0'); // 填充为两位数  
  
  // 使用模板字符串格式化日期  
  return `${year}-${month}-${day}`;  
},
gotoSendSquare(){
  wx.navigateTo({
    url: '/pages/sendSquare/sendSquare',
  })
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
    await this.getPlArr();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2  // 当前页面索引
      });
    }
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