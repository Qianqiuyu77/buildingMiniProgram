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
    longitude: 116.397477, // 经度（北京天安门）
    latitude: 39.908692, // 纬度
    locationsInfos: [],
    markers: [ // 标记点
    ],
    loading: true,
    selectedMarker: null

  },
  async getUserLocations() {
    let that = this;
    wx.getLocation({
      type: 'gcj02', // 适用于微信小程序地图
      success(res) {
        console.log('用户位置：', res);
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      },
      fail(err) {
        console.error('获取位置失败：', err);
      }
    });
  },

  setMarkers(locationsInfos) {
    let markerList = locationsInfos.map((item, index) => {
      return {
        _id: item._id,
        id: index,
        latitude: item.latitude,
        longitude: item.longitude,
        iconPath: "../../images/标记.png",
        width: 30,
        height: 30
      }
    })
    console.log(markerList);
    return markerList;
  },
  closeWindow() {
    this.setData({
      selectedMarker: null
    })
  },
  gotoLocations(e) {
    wx.navigateTo({
      url: '/pages/outer/outer?url=' + e.currentTarget.dataset.jumplink,
    })
  },
  // 标记点点击
  onMarkerTap(e) {
    console.log(e);
    const markerId = e.detail.markerId
    const marker = this.data.markers.find(m => m.id === markerId)
    const markInfo = this.data.locationsInfos.find(item => item._id === marker._id)
    console.log(markInfo);
    // wx.navigateTo({
    //   url: '/pages/outer/outer?url='+markInfo.jumpLink,
    // })
    // 让地图居中显示
    const mapCtx = wx.createMapContext('myMap'); // 获取地图上下文
    mapCtx.moveToLocation({
      longitude: marker.longitude,
      latitude: marker.latitude
    });
    this.setData({
      selectedMarker: markInfo
    })


  },

  // 地图控件操作
  onZoomIn() {
    this.mapCtx = this.mapCtx || wx.createMapContext('myMap')
    this.mapCtx.getScale({
      success: res => {
        this.mapCtx.scale({
          scale: Math.min(res.scale + 1, 18)
        })
      }
    })
  },

  onZoomOut() {
    this.mapCtx = this.mapCtx || wx.createMapContext('myMap')
    this.mapCtx.getScale({
      success: res => {
        this.mapCtx.scale({
          scale: Math.max(res.scale - 1, 3)
        })
      }
    })
  },

  onLocate() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })
  },

  async getMainInfo() {
    const pageSize = 200; // 保持每次请求200条
    let allRecords = []; // 存储所有数据
    let currentPage = 1; // 当前页码
    let total = 0; // 总数据量

    // 先获取第一页数据并得到总条数
    const firstPage = await models.mapLocation.list({
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
          models.mapLocation.list({
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

    let markerList = this.setMarkers(allRecords)

    // 更新数据
    this.setData({
      locationsInfos: allRecords,
      markers: markerList
    });

    console.log('Total records:', allRecords.length, allRecords);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMainInfo()
    this.getUserLocations()
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1 // 当前页面索引
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