// pages/myinfo/myinfo.js
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
    show:false,
    openid:"",
    name:"湖南大学三好学生",
    backUrl:"cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg",
    avatUrl:"cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg",
    hasUserInfo: false,
    tempUrl:"cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg",
    tempName:""
  },
  getinput(e){
    this.setData({
      tempName:e.detail.value
    })
  },
  async onChooseAvatar(e) {
    console.log(e);
    const { avatarUrl } = e.detail 
    const uploadRes = await wx.cloud.uploadFile({
      cloudPath: new Date().getTime() + 'photo.png',
      filePath: avatarUrl,
    });
    console.log(uploadRes);
    let imgurl = uploadRes.fileID;
    this.setData({
      tempUrl:imgurl,
    })

  },

  async createUserInfo(name,url){
    console.log(name,url,this.data.openid);
    const { data } = await models.userInfo.create({
      data: {
        userId: this.data.openid,  // openid
        name: name,  // 昵称
        url:url
      }
    });
  
    // // 返回创建的数据 id
    // console.log(data);
    // { id: "7d8ff72c665eb6c30243b6313aa8539e"}
  },
  async getUserInfo() {
    const cachedUserInfo = wx.getStorageSync('userInfo'); // 获取缓存
    console.log(cachedUserInfo);
    if (cachedUserInfo) {
      this.setData({
        avatUrl: cachedUserInfo.avatUrl,
        name: cachedUserInfo.name,
        hasUserInfo: true
      });
      app.globalData.userInfo = cachedUserInfo; // 使用缓存的数据
      return;
    }
  
    // 如果没有缓存，则从云端获取
    const { data } = await models.userInfo.get({
      filter: {
        where: {
          $and: [
            {
              userId: {
                $eq: this.data.openid,
              },
            },
          ]
        }
      },
    });
  
    if (Object.keys(data).length === 0 && data.constructor === Object) {
      this.setData({
        show: true
      });
    } else {
      this.setData({
        avatUrl: data.url,
        backUrl: data.url,
        name: data.name,
        hasUserInfo: true
      });
      const userInfo = {
        avatUrl: data.url,
        name: data.name,
        openid: this.data.openid
      };
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo); // 缓存数据
    }
  },
  
  async signIn() {
    if (this.data.tempName === "") {
      wx.showToast({
        title: '昵称不得为空',
        icon: 'error'
      });
      return;
    }
    await this.createUserInfo(this.data.tempName, this.data.tempUrl);
    const newUserInfo = {
      avatUrl: this.data.tempUrl,
      name: this.data.tempName,
      openid: this.data.openid
    };
    this.setData({
      backUrl: this.data.tempUrl,
      avatUrl: this.data.tempUrl,
      name: this.data.tempName,
      show: false,
      hasUserInfo: true
    });
    app.globalData.userInfo = newUserInfo;
    wx.setStorageSync('userInfo', newUserInfo); // 更新缓存
    console.log(app.globalData.userInfo);
  },

  jump0(){
    wx.navigateTo({
      url: '/pages/category/category?index=0',
    })
  },
  jump1(){
    wx.navigateTo({
      url: '/pages/category/category?index=1',
    })
  },
  jump2(){
    wx.navigateTo({
      url: '/pages/category/category?index=2',
    })
  },
  jump3(){
    wx.navigateTo({
      url: '/pages/category/category?index=3',
    })
  },
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: "18293639298",
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },

  exit(){
    app.globalData.userInfo={}
    this.setData({
      avatUrl: 'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg',
      hasUserInfo: false
    })
  },
  async getOpenId(){
    wx.cloud.callFunction({
      name: 'getOpenId',
    }).then(res=>{
      const openId = res.result?.openid;
      wx.setStorageSync('openid',openId)
      this.setData({
        openid: openId
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    await this.getOpenId()
    // await this.getUserInfo()
  },
  onLaunch: function () {
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3  // 当前页面索引
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