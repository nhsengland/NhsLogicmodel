var modalHtmlTpl =
"<div class=\\\"modal\\\" id=\\\"modal-%blockId%\\\">" +
"  <div class=\\\"modal-content style-%style%\\\" style=\\\"background-color: %bgcolor%;\\\">" +
"    <div class=\\\"modal-head\\\"><a class=\\\"close-btn\\\" onclick=\\\"document.getElementById(\\\'embed-mode-modal\\\').remove();\\\">close</a></div>" +
"    <div class=\\\"modal-body\\\">" +
"      <div class=\\\"modal-view-mod previewOnly\\\">" +
"        <div>" +
"          <h2>%title%</h2>" +
"          %description%" +
"        </div>" +
"      </div>" +
"    </div>" +
"  </div>" +
"  <div class=\\\"modal-bg\\\"></div>" +
"</div>";

if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
      if (this.parentNode) {
          this.parentNode.removeChild(this);
      }
  };
}

var startDrawing = function() {
  var drawerInstance = new drawer('myCanvas');
  drawerInstance.init();
  drawerInstance.arrowMode = 1;
  drawerInstance.draw(kanban_connections, arrowStyles);
  return drawerInstance;
};

var initModal = function() {
  let cardBodyList = document.querySelectorAll('div.card_body');
  if(cardBodyList.length > 0) {
    for(var i in cardBodyList) {
      if(typeof cardBodyList[i] == 'object') {
        cardBodyList[i].addEventListener('click', function(event) {
          event.stopPropagation();
          let cardNode = event.currentTarget.parentNode.parentNode;
          let modalHtml = getBlockHtml(cardNode.dataset.blockId);
          let embedModeModalId = 'embed-mode-modal';
          let modalNode = document.getElementById(embedModeModalId);
          if(modalNode) {
            modalNode.remove();
          }
          modalNode = document.createElement('div');
          modalNode.id = embedModeModalId;
          modalNode.innerHTML = modalHtml;
          document.body.appendChild(modalNode);
        });
      }
    }
  }
};
var highlightRelates = {};
var highlightedConnections = [];
var initHighlight = function() {
  let highlightButtonList = document.querySelectorAll('.highlight-journey');
  if(highlightButtonList.length > 0) {
    for(var i in highlightButtonList) {
      if(typeof highlightButtonList[i] == 'object') {
        highlightButtonList[i].addEventListener('click', function(event) {
          event.stopPropagation();
          let cardNode = event.currentTarget.parentNode.parentNode.parentNode;
          let block_id = cardNode.dataset.blockId;
          let status = !highlightRelates[block_id] ? true : false;
          highlightRelates = {};
          highlightedConnections = [];
          document.querySelector('body').classList.remove('body-highlight-relates-active');
          var allHighlightedActiveRelates = document.querySelectorAll('.highlight-relates-active');
          if(allHighlightedActiveRelates.length > 0) {
            for(var j in allHighlightedActiveRelates) {
              if(typeof allHighlightedActiveRelates[j] == 'object') {
                allHighlightedActiveRelates[j].classList.remove('highlight-relates-active');
                allHighlightedActiveRelates[j].querySelector('.highlight-journey span').innerHTML = 'Highlight';
              }
            }
          }

          if(status) {
            event.currentTarget.children[0].innerHTML = 'Cancel highlight';
            highlightRelates[block_id] = status;
            let connectionClone = JSON.parse(JSON.stringify(kanban_connections));
            let allRelatedBlocksId = _findRelatedBlocks(connectionClone, block_id, [], null, highlightedConnections);

            if(highlightedConnections.length > 0) {
              drawerInstance.draw(highlightedConnections, arrowStyles);
            }

            document.querySelector('body').classList.add('body-highlight-relates-active');
            for(let i in allRelatedBlocksId) {
              document.querySelector('[data-block-id=\\\"' + allRelatedBlocksId[i] + '\\\"]').classList.add('highlight-relates-active');
            }
          }
          else {
            drawerInstance.draw(kanban_connections, arrowStyles);
          }
        });
      }
    }
  }

  let kanbanContent = document.querySelector('.drag-list.drag-list-content');
  kanbanContent.addEventListener('click', function(event) {
    /* cancellingSelection */
    highlightedConnections = [];
    highlightRelates = {};
    document.querySelector('body').classList.remove('body-highlight-relates-active');
    let allActiveHighlighted = document.querySelectorAll('.highlight-relates-active');
    if(allActiveHighlighted.length > 0) {
      for(var i in allActiveHighlighted) {
        if(typeof allActiveHighlighted[i] == 'object') {
          allActiveHighlighted[i].querySelector('.highlight-journey span').innerHTML = 'Highlight';
          allActiveHighlighted[i].classList.remove('highlight-relates-active');
        }
      }
    }
    drawerInstance.draw(kanban_connections, arrowStyles);
  });
};

var _findRelatedBlocks = function(connections, block_id, allRelatedBlocksId, direction, activeConnections) {
  allRelatedBlocksId[block_id] = [block_id];
  for(let i in connections) {
    let connectionFrom = connections[i][0];
    let connectionTo = connections[i][1];
    if(connectionFrom === false && connectionTo === false) {
      continue;
    }

    if(connectionFrom == block_id && (!direction || direction === 'right')) {
      allRelatedBlocksId[connectionTo] = connectionTo;
      activeConnections[i] = connections[i];
      connections[i] = [false, false];
      allRelatedBlocksId = this._findRelatedBlocks(connections, connectionTo, allRelatedBlocksId, 'right', activeConnections);
    }

    if(connectionTo == block_id && (!direction || direction === 'left')) {
      allRelatedBlocksId[connectionFrom] = connectionFrom;
      activeConnections[i] = connections[i];
      connections[i] = [false, false];
      allRelatedBlocksId = this._findRelatedBlocks(connections, connectionFrom, allRelatedBlocksId, 'left', activeConnections);
    }
  }
  return allRelatedBlocksId;
};

var getBlockHtml = function(blockId) {
  let block;
  kanban_blocks.forEach(function(e, i) {
    if(e.id == blockId) {
      block = e;
      return;
    }
  });
  return modalHtmlTpl
    .replace('%blockId%', block.id)
    .replace('%title%', block.title)
    .replace('%style%', block.style ? block.style : 'default')
    .replace('%bgcolor%', block.bgcolor ? block.bgcolor : 'white')
    .replace('%description%', block.description ? block.description : '')
    ;
};

var drawerInstance;
if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  drawerInstance = startDrawing();
  initModal();
  initHighlight();
} else {
  document.addEventListener("DOMContentLoaded", function() {
    drawerInstance = startDrawing();
    initModal();
    initHighlight();
  });
}