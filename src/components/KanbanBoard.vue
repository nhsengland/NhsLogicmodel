<template>
  <div>
    <div class="drag-container">
      <div class="column-header">
        <div>
          <ul class="drag-list drag-list-heading">
            <li v-for="stage in stages" class="drag-column" :data-stage-id="stage.id" :key="stage.id">
              <div class="drag-column-header">
                <div>
                  <h2 class="previewOnly">{{stage.name}}</h2>
                  <input
                    class="edit"
                    type="text"
                    :value="stage.name"
                    @blur="updateStage(stage.id, 'name', $event.target.value)"
                    @keyup.enter="loseFocus"
                  />
                </div>
                <a class="delete-column-btn edit" @click="removeStage(stage.id)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/><path fill="none" d="M0 0h24v24H0z"/></svg></a>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- .drag-list -->
      <ul class="drag-list drag-list-content" @click="cancellingSelection">
        <li
          v-for="stage in stages"
          class="drag-column"
          :class="{['drag-column-' + stage.id]: true}"
          :key="stage.id"
        >
          <span class="drag-column-header">
            <slot :name="stage.name"></slot>
          </span>

          <ul class="drag-inner-list" ref="list" :data-stageref="stage.id">
            <!--.drag-item -->
            <li
              :class="'drag-item style-' + block.style"
              :style="{
                backgroundColor: block.bgcolor,
                marginTop: block.marginTop ? block.marginTop + 'px' : '10px',
                marginBottom: block.marginBottom ? block.marginBottom + 'px' : '0px'
              }"
              v-for="block in structuredBlocks[stage.id]"
              :data-block-id="block.id"
              :key="block.id"
              :id="'block-' + block.id"
              @click="$event.stopPropagation ? $event.stopPropagation() : $event.cancelBubble = true; openViewModal(block, stage)"
            >
            <v-style>
              #block-{{ block.id }}.drag-item{
                background-color:{{ block.bgcolor}};
                border-color: {{ block.bordercolor}}!important;
              }
              #block-{{ block.id }}.drag-item .card_h2{
                color:{{ block.txtcolor}}!important;
              }
              #block-{{ block.id }}.drag-item svg{
                fill:{{ block.txtcolor}}!important;
              }
              #block-{{ block.id }}.drag-item h2, #block-{{ block.id }}.drag-item p, #block-{{ block.id }}.drag-item a{
                color:{{ block.txtcolor}}!important;
              }
            </v-style>
              <slot :name="block.id">
                <div>
                  <div class="movable edit">
                    <span class="handle edit" @click="formatPainting($event, block.id)"></span>
                  </div>

                  <div class="card_body" v-if="!viewMode || block.type != 'link'">
                    <h2 :class="{
                      'previewOnly': true,
                      'icon-open_in_new': block.type == 'link'
                    }">{{ block.title }}</h2>
                    <textarea
                      :class="'edit card_h2 ' + (block.type == 'link' ? 'icon-open_in_new' : '')"
                      :style="{
                        'height': block.titleHeight ? block.titleHeight + 'px' : 'auto'
                      }"
                      type="text"
                      rows="1"
                      placeholder="Enter Card Title"
                      :value="block.title"
                      @blur="updateBlock(block.id, 'title', $event.target.value)"
                      @keyup.enter="quickBlockTitleEntered(block.id, stage.id)"
                      @keydown="autosize($event.target)"
                    ></textarea>
                    <p>{{ block.teaser }}</p>
                  </div>

                  <a class="previewOnly card_body" v-if="block.type == 'link'" :href="block.url ? block.url : '#'" :target="block.url ? '_blank' : ''">
                    <h2 class="icon-open_in_new">{{ block.title }}</h2>
                    <p>{{ block.teaser }}</p>
                  </a>

                  <div class="card-op-panel">
                    <a class="edit-icon-btn edit" @click="toggleBlockEditModal(block, 1, stage, $event)">
                      Edit card
                    </a>
                    <a class="edit-icon-btn edit svg-text-btn" @click="toggleBlockFormatPaint($event, block)">
                      <span v-if="!formatPaint || formatPaint.src_block_id != block.id">Copy format</span>
                      <span v-if="formatPaint && formatPaint.src_block_id == block.id">Cancel format</span>
                    </a>
                    <a class="edit-icon-btn edit svg-text-btn" @click="toggleBlockHighlightRelates($event, block)">
                      <span v-if="!highlightRelates[block.id]">Highlight</span>
                      <span v-if="highlightRelates[block.id]">Cancel highlight</span>
                    </a>
                  </div>

                  <div class="card-op-panel previewOnly">
                    <a class="edit-icon-btn svg-text-btn highlight-journey" @click="toggleBlockHighlightRelates($event, block)">
                      <span v-if="!highlightRelates[block.id]">Highlight</span>
                      <span v-if="highlightRelates[block.id]">Cancel highlight</span>
                    </a>
                  </div>

                </div>

                <div class="pin-left edit"></div>
                <div class="pin-right edit"></div>
              </slot>
            </li>
          </ul>
          <div class="drag-column-footer edit">
            <slot :name="`footer-${stage}`">
              <a @click="addCard(stage.id)" class="add-card-btn btn" :id="'add-card-for-stage-' + stage.id">
                <span class="add-card-btnicon">+</span>
                <span class="add-card-btntxt">Add Card</span>
              </a>
            </slot>
          </div>
        </li>
        <!--/.drag-item -->
      </ul>
      <!-- /.drag-list -->
    </div>

    <BgCanvas ref="BgCanvas" @updateConnections="updateConnections" :connections="connections"></BgCanvas>
    <BlockEditModal
      @toggleBlockEditModal="toggleBlockEditModal"
      @removeBlock="removeCard"
      :popup="popup"
      :block="editingBlock"
      :stage="editingStage"
    ></BlockEditModal>
  </div>
</template>

<script>
import dragula from "../assets/dragula_mod/dragula";
// let lodash_debounce = require("lodash.debounce");

export default {
  name: "KanbanBoard",

  props: {
    connections: null
  },
  data() {
    return {
      popup: 0,
      timer: null,
      editingBlock: null,
      editingStage: null,
      elOffsetY: 0,
      mirrorOffsetY: 0,
      lastStage: null, //last stage who gets new block.
      enterPressedCount: 0,
      formatPaint: null,
      highlightRelates: {},
      highlightedConnections: []
    };
  },

  components: {
    BgCanvas: () => import("./BgCanvas"),
    BlockEditModal: () => import("./BlockEditModal")
  },

  computed: {
    viewMode() {
      return this.$store.state.viewMode;
    },
    stages() {
      return this.$store.state.stages;
    },
    structuredBlocks() {
      let blocksOrdering = this.$store.state.blocksOrdering;
      let blocks = this.$store.state.blocks;

      let theStructuredBlocks = {};

      for (let stageId in blocksOrdering) {
        let theBlocks = [];
        if(blocks.length > 0) {
          for (let i in blocksOrdering[stageId]) {
            let block = blocks.filter(
              block => block.id == blocksOrdering[stageId][i]
            );

            theBlocks.push(block[0]);
          }
        }
        theStructuredBlocks[stageId] = theBlocks;
      }

      return theStructuredBlocks;
    }
  },

  methods: {
    addCard(stageref) {
      this.$store.commit("addBlock", stageref);
      let blocks = this.$store.state.blocks;
      let blockId = blocks[blocks.length - 1].id;

      setTimeout(() => {
        let input = document.querySelector('[data-block-id="' + blockId + '"] .card_h2');
        input.focus();
        input.select();
      }, 100);
    },

    loseFocus() {
      document.activeElement.blur();
    },

    quickBlockTitleEntered(blockId, stageId) {
      this.lastStage = stageId;
      document.activeElement.blur();
      this.enterPressedCount = 0;
    },

    updateConnections(connections) {
      this.$emit("updateConnections", connections);
    },

    updateStage(id, key, value) {
      this.$store.commit("putStage", { id: id, key: key, value: value });
    },

    removeCard(cardId) {
      this.$store.commit("removeBlock", cardId);
      //we kill the connections as the card is removed
      this.$refs.BgCanvas.destroyConnections(cardId);
      this.refreshBg();
    },

    updateBlock(id, field, value) {
      this.$store.commit('putBlock', {
        id: id,
        key: field,
        value: value
      });

      if(field == 'title') {
        let scrollHeight = document.querySelector(`#block-${id} textarea.card_h2`).scrollHeight;
        this.$store.commit('putBlock', {
          id: id,
          key: 'titleHeight',
          value: scrollHeight > 0 ? scrollHeight : null
        });
      }
      if(field == 'title' || field == 'teaser') {
        this.refreshBg();
      }
    },

    removeStage(stageId) {
      if (
        this.$store.state.blocksOrdering[stageId] &&
        this.$store.state.blocksOrdering[stageId].length > 0
      ) {
        alert(
          "This column has cards. Move or remove them before deleting this column."
        );
        return;
      }
      this.$store.commit("removeStage", stageId);


      setTimeout(() => {
         this.refreshBg();
      }, 100);

    },

    toggleBlockEditModal(block, state, stage, event) {
      if(event) {
        if (event.stopPropagation) {
          event.stopPropagation();
         } else {
           event.cancelBubble = true;
         }
      }
      this.popup = state;
      if(state) {
        this.editingBlock = block;
        this.editingStage = stage;
      }
      else {
        this.editingBlock = null;
        this.editingStage = null;
        this.refreshBg();
      }

      if(!this.$store.state.viewMode) {
        let input = document.querySelector('[data-block-id="' + block.id + '"] .card_h2');
        this.autosize(input);
      }
    },

    cancellingSelection() {
      if(this.formatPaint) {
        let this_formatPaint_srcBlockId = this.formatPaint.src_block_id;
        document.querySelector('[data-block-id="' + this_formatPaint_srcBlockId + '"]').classList.remove('format-paint-active');
        document.querySelector('body').classList.remove('body-format-paint-active');
        this.formatPaint = null;
      }

      this.highlightRelates = {};
      this.highlightedConnections = [];
      document.querySelector('body').classList.remove('body-highlight-relates-active');
      let allHighlightedActiveRelates = document.querySelectorAll('.highlight-relates-active');
      if(allHighlightedActiveRelates.length > 0) {
        for(let i in allHighlightedActiveRelates) {
          if(typeof allHighlightedActiveRelates[i].classList != 'undefined') {
            allHighlightedActiveRelates[i].classList.remove('highlight-relates-active');
          }
        }
      }

      this.refreshBg();
    },

    toggleBlockFormatPaint(event, block) {
      if(event) {
        if (event.stopPropagation) {
          event.stopPropagation();
         } else {
           event.cancelBubble = true;
         }
      }
      if(this.formatPaint === null) {
        this.formatPaint = {
          src_block_id: block.id,
          bgcolor: block.bgcolor,
          bordercolor: block.bordercolor,
          style: block.style,
          txtcolor: block.txtcolor,
          arrowcolor: block.arrowcolor,
        };
        document.querySelector('[data-block-id="' + block.id + '"]').classList.add('format-paint-active');
        document.querySelector('body').classList.add('body-format-paint-active');
      }
      else {
        let this_formatPaint_srcBlockId = this.formatPaint.src_block_id;
        document.querySelector('[data-block-id="' + this_formatPaint_srcBlockId + '"]').classList.remove('format-paint-active');
        document.querySelector('body').classList.remove('body-format-paint-active');
        this.formatPaint = null;
        if(block.id != this_formatPaint_srcBlockId) {
          this.toggleBlockFormatPaint(block);
        }
      }
    },

    _findRelatedBlocks(connections, block_id, allRelatedBlocksId, direction, activeConnections) {
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
    },

    toggleBlockHighlightRelates(e, block) {
      // Prevent openning modal.
      if(e) {
        if (e.stopPropagation) {
          e.stopPropagation();
         } else {
           e.cancelBubble = true;
         }
      }

      let doHighlight = !this.highlightRelates[block.id] ? true : false;
      this.highlightRelates = {};
      this.highlightedConnections = [];

      // reset highlight classes.
      document.querySelector('body').classList.remove('body-highlight-relates-active');
      let allHighlightedActiveRelates = document.querySelectorAll('.highlight-relates-active');
      if(allHighlightedActiveRelates.length > 0) {
        for(let i in allHighlightedActiveRelates) {
          if(typeof allHighlightedActiveRelates[i].classList != 'undefined') {
            allHighlightedActiveRelates[i].classList.remove('highlight-relates-active');
          }
        }
      }

      if(doHighlight) {
        this.highlightRelates[block.id] = doHighlight;
        let connectionClone = JSON.parse(JSON.stringify(this.connections));
        let allRelatedBlocksId = this._findRelatedBlocks(connectionClone, block.id, [], null, this.highlightedConnections);

        this.refreshBg();

        // highlight all related blocks
        document.querySelector('body').classList.add('body-highlight-relates-active');
        for(let i in allRelatedBlocksId) {
          document.querySelector('[data-block-id="' + allRelatedBlocksId[i] + '"]').classList.add('highlight-relates-active');
        }
      }
      else {
        this.refreshBg();
      }
      this.$store.commit("forceRefreshBlocks");
    },

    formatPainting(event, blockId) {
      if(event) {
        if (event.stopPropagation) {
          event.stopPropagation();
         } else {
           event.cancelBubble = true;
         }
      }
      if(this.formatPaint === null) {
        return ;
      }
      this.updateBlock(blockId, 'bgcolor', this.formatPaint.bgcolor);
      this.updateBlock(blockId, 'bordercolor', this.formatPaint.bordercolor);
      this.updateBlock(blockId, 'style', this.formatPaint.style);
      this.updateBlock(blockId, 'txtcolor', this.formatPaint.txtcolor);
      this.updateBlock(blockId, 'arrowcolor', this.formatPaint.arrowcolor);

      if(!event.shiftKey) {
        let this_formatPaint_srcBlockId = this.formatPaint.src_block_id;
        document.querySelector('[data-block-id="' + this_formatPaint_srcBlockId + '"]').classList.remove('format-paint-active');
        document.querySelector('body').classList.remove('body-format-paint-active');
        this.formatPaint = null;
      }
      else {
        document.getSelection().removeAllRanges();
      }

      this.refreshBg();
    },

    openViewModal(block, stage) {
      if(this.$store.state.viewMode) {
        this.toggleBlockEditModal(block, 1, stage);
      }
    },

    refreshStart() {
      var $this = this;

      $this.preventSelection(1);

    },

    refreshStop() {
      this.preventSelection(0);
    },

    refreshBg() {
      let connections = null;
      if(this.highlightedConnections.length > 0) {
        connections = this.highlightedConnections;
      }
      this.$refs.BgCanvas.refreshConnections(connections);
    },

    preventSelection(state) {
      this.$refs.BgCanvas.preventSelection(state);
    },
    autosize(el){
      setTimeout(function(){
        el.style.cssText = 'height:auto;';
        if(el.scrollHeight > 0) {
          el.style.cssText = 'height:' + el.scrollHeight + 'px';
        }
      },0);
    }
  },

  mounted() {
    var $this = this;

    window.addEventListener('keyup', function(event) {
      if(event.code === 'Enter' && !$this.popup) {
        $this.enterPressedCount++;

        if(event.shiftKey){
            if (event.altKey) { $this.addCard($this.lastStage -1);}
            else { $this.addCard($this.lastStage + 1); }
          }

        if($this.lastStage && $this.enterPressedCount >= 2) {

         if(!event.shiftKey){
           $this.addCard($this.lastStage);
         }

         $this.lastStage = null;
          $this.enterPressedCount = 0;
        }
      }
      else if(event.code === 'Escape') {
        if($this.popup) {
          $this.toggleBlockEditModal(null, 0, null);
        }
        if($this.formatPaint !== null) {
          let this_formatPaint_srcBlockId = $this.formatPaint.src_block_id;
          document.querySelector('[data-block-id="' + this_formatPaint_srcBlockId + '"]').classList.remove('format-paint-active');
          document.querySelector('body').classList.remove('body-format-paint-active');
          $this.formatPaint = null;
        }
      }
    });

    dragula($this.$refs.list, {
      moves: function(el, container, handle) {
        return handle.classList.contains("handle");
      },
      invalid: function(el, handle) {
        let cardBody = handle.parentNode.parentNode.parentNode;
        if($this.formatPaint !== null) {
          return true;
        }
        if(document.querySelector('body').classList.contains('body-highlight-relates-active')) {
          if(!cardBody.classList.contains('highlight-relates-active')) {
            return true;
          }
        }
        return false;
      }
    })
      .on("drag", el => {
        $this.refreshStart();

        $this.elOffsetY = el.getBoundingClientRect().top;

        el.classList.add("is-moving");

        //prevent annoying selection while dragging
      })


      .on("drop", (block, list, source) => {
        let blockId = block.dataset.blockId;

        // remove ordering from src column
        let oldOrdering = [];
        for (let i = 0; i < source.children.length; i++) {
          oldOrdering.push(source.children[i].dataset.blockId);
        }
        if (oldOrdering.length > 0) {
          this.$store.commit("putBlocksOrdering", {
            stageref: source.dataset.stageref,
            orderedBlockIds: oldOrdering
          });
        } else {
          this.$store.commit(
            "removeBlocksOrderingByStage",
            source.dataset.stageref
          );
        }

        // insert ordering to target column
        let newOrdering = [];
        for (let i = 0; i < list.children.length; i++) {
          newOrdering.push(list.children[i].dataset.blockId);
        }

        this.$store.commit("putBlocksOrdering", {
          stageref: list.dataset.stageref,
          orderedBlockIds: newOrdering
        });
        this.$store.commit("putBlock", {
          id: blockId,
          key: "stageref",
          value: list.dataset.stageref
        });

        this.$store.commit("forceRefreshBlocks");

        if ($this.mirrorOffsetY < 20 ) {
          $this.removeCard( blockId );
        }
      })
      .on("dragend", el => {
        $this.refreshStop();

        el.classList.remove("is-moving");

        window.setTimeout(() => {
          el.classList.remove("is-moved");
        }, 0);

      setTimeout(() => {
        $this.refreshBg()
      }, 100);


    })
    .on("dragging", () => {


         var mirror = document.querySelector('.gu-mirror');
         $this.mirrorOffsetY = mirror.getBoundingClientRect().top;

            if ($this.mirrorOffsetY < 20 ) {
              //  mirror.style.backgroundColor = "#feb8b8";
              mirror.classList.add("is-deleting");

            }
            else{
               mirror.classList.remove("is-deleting");
            }


    })

    .on("cancel", el => {

      //we delete the card by dragging it up
      if ($this.mirrorOffsetY < 20 ) {
        $this.removeCard(el.getAttribute('data-block-id'));
      } else {
      var elNewYpos = 0;
      var mtStr = el.style.marginTop;

      //if element has margins
      var elMarginTop =  mtStr.substring(0, mtStr.length - 2);
      if (mtStr!="") elMarginTop =  Number( mtStr.substring(0, mtStr.length - 2) );


      if ( Math.max( $this.mirrorOffsetY, $this.elOffsetY ) == $this.mirrorOffsetY ) {

          elNewYpos = $this.mirrorOffsetY + elMarginTop - $this.elOffsetY;
      }

      else{
          elNewYpos = 0;

          $this.$store.commit('putBlock', {
            id:  el.getAttribute('data-block-id'),
            key: 'marginBottom',
            value: elNewYpos
          });


      }


      $this.$store.commit('putBlock', {
        id:  el.getAttribute('data-block-id'),
        key: 'marginTop',
        value: elNewYpos
      });


      $this.mirrorOffsetY = 0;
      $this.elOffsetY = 0;

      $this.$store.commit("forceRefreshBlocks");
    }


    })
  }
};
</script>

<style lang="scss">
#myCanvas {
  position: fixed;
  z-index: -1;
  top: 0;
  left: 0;
  pointer-events: none;
}
.mode--viewer #myCanvas{
  z-index: 2;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
}
</style>