function Share(opts) {
  if (!(this instanceof Share)) return new Share(opts || {});
  if (opts.THREE) opts = {game:opts};
  if (!opts.key) throw new Error('Get a key: http://api.imgur.com/');
  this.key     = opts.key;
  this.game    = opts.game;
  this.message = opts.message || 'Greetings from voxel.js! @voxeljs';
  this.type    = opts.type    || 'image/png';
  this.quality = opts.quality || 0.75;
  this.opened  = false;
}
module.exports = Share;

Share.prototype.open = function(append) {
  this.close();
  this.element = this.createElement();
  append = append || document.body;
  append.appendChild(this.element);
  this.opened = true;
};

Share.prototype.close = function() {
  if (this.element != null) {
    this.element.parentNode.removeChild(this.element);
  }
  this.element = null;
  this.opened = false;
};

Share.prototype.submit = function() {
  var self = this;
  var fd = new FormData();
  fd.append('image', String(this.image.src).split(',')[1]);
  fd.append('key', this.key);
  if (this.message) fd.append('caption', this.message);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://api.imgur.com/2/upload.json');
  xhr.onload = function() {
    // todo: error check
    self.tweet(JSON.parse(xhr.responseText).upload.links.imgur_page);
    self.close();
  };
  xhr.send(fd);
};

Share.prototype.tweet = function(imgUrl) {
  var url = 'http://twitter.com/home?status=' + this.message + ' ' + imgUrl;
  window.open(url, 'twitter', 'width=550,height=450');
};

Share.prototype.createElement = function() {
  var self = this;
  var e = document.createElement('div');
  e.className = 'voxel-share';

  // create image
  this.image = new Image();
  this.game.renderer.render(this.game.scene, this.game.camera);
  this.image.src = this.game.element.toDataURL(this.type, this.quality);
  e.appendChild(this.image);

  // create text input
  var msgBox = document.createElement('textarea');
  msgBox.value = this.message;
  e.appendChild(msgBox);
  setTimeout(function() { msgBox.focus(); }, 500);

  // submit button
  var button = document.createElement('button');
  button.innerHTML = 'Upload Image';
  e.appendChild(button);
  button.onclick = function() {
    this.innerHTML = 'Uploading...';
    self.submit();
  };

  return e;
};
