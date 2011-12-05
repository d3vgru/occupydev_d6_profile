// Window_Manager.js
var WindowManager = {
  init: function() {
    this.header = JQ('#xcHeaderWrapper');
    this.footer = JQ('#xcFooterWrapper');
    this.content = JQ('#xcWrapper');

    JQ(window).resize(function() {
      WindowManager.resize();
    })

    // Ensure the resizing happens after rendering is complete
    setTimeout("WindowManager.resize()", 0);
  },

  contentHeight: function() {
    return this.windowHeight() - this.headerHeight() - this.footerHeight();
  },

  contentHeightInner: function() {
    return JQ('#xcContent').height();
  },

  windowHeight: function() {
    return JQ(window).height();
  },

  headerHeight: function() {
    return this.header.height();
  },

  footerHeight: function() {
    return this.footer.height();
  },

  resize: function() {
    this.content.css({
      position: 'absolute',
      top: this.headerHeight(),
      height: this.contentHeight()
    });

    JQ('.xcAutoResize').css({
      height: this.contentHeight()
    });

    JQ('.xcAutoPosition').css({
      top: this.headerHeight()
    });
  }
}


JQ(document).ready(function() {
  WindowManager.init();
});