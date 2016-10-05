'use strict';


(()=>{
    this.tabStacheId = '0';
    
    document.addEventListener('DOMContentLoaded', ()=>{
      let new_stache = document.getElementById('new_stache');
      let submit_button = document.getElementById('submit_button');
      let stache_list = document.getElementById('stache_list');
    
      chrome.bookmarks.search({'title':'TabStache_base'}, (results)=> {
        if (results.length === 0) {
          chrome.bookmarks.getTree((tree)=>{
              const otherBookmarksID = tree[0].children[1].id;
              chrome.bookmarks.create({
                'parentId': otherBookmarksID,
                'title': 'TabStache_base'
              }, (node)=> {
                this.tabStacheId = node.id;
              });
          });
        } else {
          this.tabStacheId = results[0].id;
          chrome.bookmarks.getChildren(this.tabStacheId, (children)=>{
            children.forEach((bookmark)=> {
              let stache = document.createElement('button');
              stache.setAttribute('value', bookmark.id);
              stache.setAttribute('class', 'stache');
              stache.addEventListener('click', unload_stache);
              stache.appendChild(document.createTextNode(bookmark.title));
              let li = document.createElement('article');
              li.appendChild(stache);
              stache_list.appendChild(li);
            });
          });
        }
      });
    
      new_stache.addEventListener('keyup', (e)=>{
        if ((e.keyCode == 13) && (new_stache.value)) {
          add_stache.apply(this);
        }
      });
    
      submit_button.addEventListener('click', ()=>{
        if (new_stache.value) {
          add_stache.apply(this);
        }
      });
    
      function add_stache(){
        chrome.bookmarks.create({
          'parentId': this.tabStacheId,
          'title': new_stache.value
        }, load_stache);
        new_stache.value = "";
      }
    
      function load_stache(node) {
        chrome.tabs.getAllInWindow(null, (tabs)=>{
          chrome.tabs.create({});
          let urls = tabs.map(tab => tab.url);
          for (let i in tabs) {
          	// some tabs should be ignored
          	// 1. ignore dublicate tabs
          	if(urls.indexOf(tabs[i].url) < i)
          		continue;
          	// 2. ignore some specified types of tabs
          	if(tabs[i].url.startsWith("chrome-extension://") || tabs[i].url.startsWith("chrome://") || tabs[i].url.startsWith("about:blank"))
        		continue;
            chrome.bookmarks.create({
              'parentId': node.id,
              'title': tabs[i].title,
              'url': tabs[i].url});
            chrome.tabs.remove(tabs[i].id);
          }
        });
      }
    
      function unload_stache() {
        chrome.bookmarks.getChildren(this.value, (children)=>{
           children.forEach((bookmark)=>{
             chrome.tabs.create({url: bookmark.url});
           });
           chrome.bookmarks.removeTree(this.value);
        });
      }
    }, false);
})();
