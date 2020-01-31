<template>
  <div>
    <canvas id="myCanvas" width="1920" height="3080"></canvas>
  </div>
</template>

<script>
// import { log } from "util";
import drawer from "../assets/lib/drawer.class";
export default {
  name: "BgCanvas",

  props: {
    connections: null
  },
  data() {
    return {
      drawer: new drawer("myCanvas"),
      currentConnection: [],
      currentDisConnection: [],
      cloneConnections: [],
    };
  },

  watch: {
    connections: function() {
      this.refreshConnections();
    }

  },

  methods: {
    emitConnections() {
      this.$emit("updateConnections", this.cloneConnections);
    },
    init() {
      var $this = this;

      this.drawer.init();
      //we refresh the connections
      if (this.connections > 0) $this.refreshConnections();
    },

    getId(el) {
      return el.getAttribute("data-block-id");
    },

    updatePinState() {
      //we remove all the classes to make the little dots active
      var sections = document.querySelectorAll(".drag-item");
      for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove("connectOut");
        sections[i].classList.remove("connectIn");
      }

      this.connections.forEach(function(e) {
        document.querySelector("[data-block-id='" + e[0] + "']").className +=
          " connectOut";
        document.querySelector("[data-block-id='" + e[1] + "']").className +=
          " connectIn";
      });
    },

    getIndexInList(child) {
      return Array.prototype.indexOf.call(
        child.parentNode.childNodes,
        child
      );
    },

    //see the children and align
    alignItem(itemId) {
      let _this = this;
      var el = document.querySelector("[data-block-id='" + itemId + "']");

      var childrenCount = 0;

      var firstIndex = 1000;
      var lastIndex = 0;

      var firstChild;
      var lastChild;

      //for all the childrens
      this.connections.forEach(function(e) {
        if (e[0] == itemId) {

          //the child
          var child = document.querySelector("[data-block-id='" + e[1] + "']");

          //this index on the list
          var currentIndex = _this.getIndexInList(child);

          // if the current index is smaller, we assign this object to be higher
          if (Math.min(currentIndex, firstIndex) == currentIndex) {
            firstIndex = currentIndex;
            firstChild = child;
          }

          // if current index is bigger this is the last child
          if (Math.max(currentIndex, lastIndex) == currentIndex) {
            lastIndex = currentIndex;
            lastChild = child;
          }

          childrenCount++;
        }
      });

      if (childrenCount > 1) {

        var marginTop = ( lastChild.getBoundingClientRect().top - 115 ) + (lastChild.offsetHeight / 2);
        var offsetY = firstChild.getBoundingClientRect().top - 115;

        var yAlign = (marginTop - offsetY + 20) / 2;

        _this.$store.commit('putBlock', {
          id:  el.getAttribute('data-block-id'),
          key: 'marginTop',
          value: yAlign
        });
        _this.$store.commit('putBlock', {
          id:  el.getAttribute('data-block-id'),
          key: 'marginBottom',
          value: yAlign
        });
      }
    },

    //disconnect a pair
    disconnect(pair) {
      let _this = this;
      pair = pair.reverse();

      // we parse the connection array and remove
      this.connections.forEach(function(e, i) {
        //not sure about this comparison method but it works
        if (String(e) == String(pair)) {
          _this.cloneConnections = JSON.parse(
            JSON.stringify(_this.connections)
          );
          _this.cloneConnections.splice(i, 1);
          _this.emitConnections();
        }
      });
    },

    //in case a card is deleted we need all his connections to be removed
    destroyConnections(objectId) {
      var connectionToDestroy = [];

      //we get all the connections to destroy
      this.connections.forEach(function(e, i) {
        //if the object is referred as output or input in the connection area
        if (e[0] == objectId || e[1] == objectId) {
          connectionToDestroy.push(i);
        }
      });

      this.cloneConnections = JSON.parse(JSON.stringify(this.connections));
      //we destroy all the connections
      for (let i in connectionToDestroy) {
        this.cloneConnections[connectionToDestroy[i]] = null;
      }

      this.cloneConnections = this.cloneConnections.filter(function(el) {
        return el != null;
      });
      this.emitConnections();
    },

    //if exact pair exist
    ifConnectionExist(pair) {

      var isExist;

      // we parse the connection array and remove
      this.connections.forEach(function(e) {
        //not sure about this comparison method but it works
        if (String(e) == String(pair)) isExist = true;
        else isExist = false;
      });

      return isExist;
    },

    //if the object has output connection
    hasOutputConnections(outputId) {
      var isExist = false;

      this.connections.forEach(function(e) {
        //not sure about this comparison method but it works
        if (e[0] == outputId) isExist = true;
        else isExist = false;
      });

      return isExist;
    },

    //if the object has output connection
    countConnections(outputId) {
      var count = 0;

      this.connections.forEach(function(e) {
        //not sure about this comparison method but it works
        if (e[0] == outputId) count++;
      });

      return count;
    },

    //recalculate connections
    refreshConnections(connections) {
      if(!connections) {
        connections = this.connections;
      }
      //if the pins are connected or not - visually
      this.updatePinState();

      this.drawer.arrowMode = this.$store.state.viewMode;

      //we draw all the lines of the canvas
      let arrowStyles = [];
      this.$store.state.blocks.forEach(function(e) {
        //not sure about this comparison method but it works
        arrowStyles[e.id] = e.arrowcolor;
      });
      this.drawer.draw(connections, arrowStyles);
    },

    preventSelection(state) {
      if (state) document.body.classList.remove("noselect");
      else document.body.classList.add("noselect");
    },

    disconnectMode(state) {
      if (!state) document.body.classList.remove("disconnecting");
      else document.body.classList.add("disconnecting");
    },

    onMouseMove(e) {
      var _this = this;

      var controlPt = 20;

      if (_this.drawer.isPressed) {
        e = e || window.event;

        _this.drawer.drawCurveLine(
          _this.drawer.pressedX,
          _this.drawer.pressedY,
          _this.drawer.pressedX + controlPt,
          e.clientY + controlPt,
          e.clientX,
          e.clientY
        );
      }
    },

    onMouseUp(e) {
      let _this = this;
      //resetting global states
       _this.drawer.isPressed = false;

      _this.disconnectMode(0);

      //target where released
      e = e || window.event;
      var target = e.target || e.srcElement;

      //connexion
      if (target.classList.contains("pin-left")) {
        if (_this.currentConnection.length) {

          var currentBlockId = Number( target.parentNode.getAttribute("data-block-id"));

            if ( _this.currentConnection[0] ==  currentBlockId ) {

            } else{
            _this.currentConnection.push( currentBlockId );

            //let's check if this connection exist
            if (!_this.ifConnectionExist(_this.currentConnection)) {

              _this.alignItem( _this.currentConnection[0] );
              //by default we say that we want to reconsider how it should be aligned
              _this.cloneConnections = JSON.parse(
                JSON.stringify(_this.connections)
              );
              _this.cloneConnections.push(_this.currentConnection);

              _this.currentConnection = [];
              _this.emitConnections();

            }
          }
        }
      }

      //disconnection
      if (target.classList.contains("pin-right")) {
        if (_this.currentDisConnection.length) {
          _this.currentDisConnection.push(
            Number(target.parentNode.getAttribute("data-block-id"))
          );

          _this.disconnect(_this.currentDisConnection);
          _this.currentDisConnection = [];
        }
      }

      _this.preventSelection(1);

      //if the drawing has started we refresh the connections
      if( _this.currentConnection.length > 0 ) _this.refreshConnections();



      //make sure this is reset
      _this.currentConnection = [];
      _this.currentDisConnection = [];




    },

    onMouseDown(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      let _this = this;
      var blocKId;

      if(typeof target.classList != 'undefined') {
        if (target.classList.contains("pin-left")) {
          blocKId = target.parentNode.getAttribute("data-block-id");
          _this.currentDisConnection.push(Number(blocKId));

          _this.preventSelection(0);
          _this.disconnectMode(1);
        }

        if (target.classList.contains("pin-right")) {
          blocKId = target.parentNode.getAttribute("data-block-id");
          _this.currentConnection.push(Number(blocKId));

          var pos = _this.drawer.getPinPos( document.querySelector("[data-block-id='" + blocKId + "']") );

          _this.drawer.isPressed = true;
          _this.drawer.pressedX = pos.outputX;
          _this.drawer.pressedY = pos.outputY;

          _this.drawer.ctx.beginPath();
          _this.drawer.ctx.moveTo(pos.outputX, pos.outputY);
          _this.drawer.ctx.stroke();

          _this.preventSelection(0);
        }
      }
    }
  },


  mounted() {
    let _this = this;
    _this.init();

    //adding the listeners
    document.body.onmousemove = function(e) {
      _this.onMouseMove(e);
    };

    document.body.onmousedown = function(e) {
      _this.onMouseDown(e);
    };

    document.body.onmouseup = function(e) {
      _this.onMouseUp(e);
    };
  }
};
</script>

<style lang="scss">
.drag-container {
  max-width: 1920px;
}

.drag-column {
  margin: 0 15px;
  background: transparent;
}

.drag-item {
  background: white;
  color: #999;
  box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.1);
  position: relative;

  &:hover {
    box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.3);
  }
}

.drag-item.is-moving {
  .pin-left,
  .pin-right {
    display: none !important;
  }

  background-color: #ffffff;
  transform: scale(1);

  .movable{
    cursor: grabbing;
  }
}

.movable {
  position: absolute;
  height: calc(100% - 34px);
  width: calc(100%);
  margin-top: 0;
  z-index: 1;
  bottom: 0px;
  left: 0px;
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;

  &:active{
    cursor: grabbing;
  }

  .handle {
    position: absolute;
    display: block;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  .handle--disabled {
    display: none;
    pointer-events: none;
  }
}

.card_body{
  position: relative;
  z-index: 0;
  height: calc(100% - 16px);
  width: calc(100% - 16px);
  top: 8px;
  left: 8px;
  cursor: pointer;
  overflow: hidden;
}

.pin-left,
.pin-right {
  background-color: #fff;
  border: 1px #000 solid;
  height: 14px;
  width: 14px;
  position: absolute;

  border-radius: 50%;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
}

.pin-left {
  left: -10px;

  .connectIn & {
    background-color: #000;
  }
}

.pin-right {
  right: -10px;

  .connectOut & {
    background-color: #000;
  }
}

.disconnecting {
  .connectIn {
    .pin-left {
      background-color: grey !important;
    }
  }

  .connectOut {
    .pin-right {
      background-color: red !important;
    }
  }
}


</style>