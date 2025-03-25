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
    searchValue: '',
    testImg: 'cloud://qianqiu-2guqlxz723dd8047.7169-qianqiu-2guqlxz723dd8047-1319929279/image/015fa55b117f2fa801202e60106a69.jpg@1280w_1l_2o_100sh.jpg',
    plArr: [],
    isOpen: false, // 控制下拉菜单显示
    options: ['材料', '产品', '案例', '科普'], // 菜单选项
    selected: '' // 选中的值
  },
   // 切换下拉菜单
   toggleDropdown() {
    this.setData({ isOpen: !this.data.isOpen });
  },

  // 选择菜单项
  selectOption(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ selected: value, isOpen: false });
    wx.showToast({ title: `选择了：${value}`, icon: 'none' });
  },
  findPl(plArr) {

    let searchValue = this.data.searchValue.trim().toLowerCase(); // 统一转换小写
    if (!searchValue) return plArr; // 如果搜索框为空，返回全部数据
  
    return plArr.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchValue) // 确保值是字符串，并进行模糊匹配
      );
    });
  },
  inputSearch(e){
    let searchValue = e.detail.value;
    console.log(searchValue);
    this.setData({
      searchValue: searchValue
    })
  },
  async resetSearch(){
    await this.getPlArr()
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
      return;
    }
    let plArr = this.data.plArr
    plArr = this.findPl(plArr)

    this.setData({
      plArr: plArr,
      searchValue: ''
    })
    setTimeout(()=> this.setData({
      searchFlag: false
    }),500)
  },
  async getPlArr() {
    const pageSize = 200; // 保持每次请求200条
    let allRecords = []; // 存储所有数据
    let currentPage = 1; // 当前页码
    let total = 0; // 总数据量
  
    // 先获取第一页数据并得到总条数
    const firstPage = await models.plBox.list({
      filter: { where: {
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
          models.plBox.list({
            filter: { where: {
  
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

    allRecords.sort((a, b) => b.createdAt - a.createdAt);
    // 更新数据状态
    this.setData({
      plArr: allRecords, // 设置所有数据
    });
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
        selected: 3  // 当前页面索引
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