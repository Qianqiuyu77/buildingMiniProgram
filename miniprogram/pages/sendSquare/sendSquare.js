
const { init } = require('@cloudbase/wx-cloud-client-sdk')
var app = getApp()
  // 指定云开发环境 ID
  wx.cloud.init({
    env: app.globalData.envParams,
  })

  const client = init(wx.cloud)

  const models = client.models
Page({
  data: {
    authorInfo: '', // 发表信息
    authorName: '', // 作者名字
    plArr: [],      // 评论信息
    img: [],        // 图片列表
    authorTime: ''  // 发表时间
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value
    });
  },

  async onChooseImage() {
    const res = await wx.chooseImage({
      count: 4, // 最多选择4张图片
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    });
    this.setData({
      img: [...this.data.img, ...res.tempFilePaths]
    });
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

  async onSubmit() {
    const { authorInfo, img } = this.data;
    const authorTime = this.getCurrentDateFormatted();

    try {
      const { data } = await models.plBox.create({
        data: {
          img,
          authorInfo,
          authorImg: app.globalData.userInfo.avatUrl,
          authorName: app.globalData.userInfo.name,
          plArr: [],
          authorTime
        }
      });
      wx.navigateBack()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      });


      console.log(data); // 输出返回的ID
    } catch (error) {
      console.error('上传失败', error);
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      });
    }
  },
  onDeleteImage(e) {
    const { index } = e.currentTarget.dataset;
    const img = [...this.data.img];
    img.splice(index, 1);
    this.setData({ img });
  },
});
