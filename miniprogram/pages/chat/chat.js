// pages/chat/chat.js
Page({
  data: {
    messages: [
      { content: "您好！请问有什么可以帮您？", isUser: false },
      { content: "我想查询我的订单状态", isUser: true },
      { content: "好的，请您提供订单编号，我将为您查询", isUser: false },
      { content: "订单号是20231108001", isUser: true },
      { content: "已为您查询到订单，当前状态：已发货", isUser: false }
    ],
    inputValue: ''
  },

  inputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  sendMessage() {
    const text = this.data.inputValue.trim();
    if (!text) return;

    const newMessages = [
      ...this.data.messages,
      { content: text, isUser: true },
      { content: "已收到您的消息，正在处理...", isUser: false }
    ];

    this.setData({
      messages: newMessages,
      inputValue: ''
    });

    // 这里可以添加实际的消息发送逻辑
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
  }
});