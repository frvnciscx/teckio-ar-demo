globalThis.self = globalThis;

class FakeImage extends EventTarget {
  constructor() { super(); this.width=1; this.height=1; this._src=''; this.complete=false; }
  get src() { return this._src; }
  set src(v) { this._src = v; queueMicrotask(()=>{ this.complete=true; this.dispatchEvent(new Event('load')); if (typeof this.onload==='function') this.onload(); }); }
}
globalThis.Image = FakeImage;
globalThis.HTMLImageElement = FakeImage;
globalThis.HTMLCanvasElement = class { constructor(){this.width=1;this.height=1;} getContext(){return null;} };
globalThis.document = {
  createElementNS: (ns,tag) => tag==='img' ? new FakeImage() : new globalThis.HTMLCanvasElement(),
  createElement:   (tag)    => tag==='img' ? new FakeImage() : new globalThis.HTMLCanvasElement(),
};
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => 'blob:fake';
if (!globalThis.URL.revokeObjectURL) globalThis.URL.revokeObjectURL = () => {};

if (typeof globalThis.FileReader === 'undefined') {
  class FileReader extends EventTarget {
    constructor(){super();this.result=null;this.error=null;this.readyState=0;this.onload=null;this.onloadend=null;this.onerror=null;}
    _fire(name,evt){const h=this[`on${name}`];if(typeof h==='function')h(evt);this.dispatchEvent(new Event(name));}
    _read(blob,kind){queueMicrotask(async()=>{try{const ab=await blob.arrayBuffer();if(kind==='arrayBuffer')this.result=ab;else if(kind==='dataURL')this.result=`data:${blob.type||'application/octet-stream'};base64,${Buffer.from(ab).toString('base64')}`;else if(kind==='text')this.result=Buffer.from(ab).toString('utf8');this.readyState=2;this._fire('load',{target:this});this._fire('loadend',{target:this});}catch(e){this.error=e;this._fire('error',{target:this});this._fire('loadend',{target:this});}});}
    readAsArrayBuffer(b){this._read(b,'arrayBuffer');}
    readAsDataURL(b){this._read(b,'dataURL');}
    readAsText(b){this._read(b,'text');}
  }
  globalThis.FileReader = FileReader;
}
