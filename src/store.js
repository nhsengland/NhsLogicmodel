import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

let config = {
  maxStages: 7
};

export default new Vuex.Store({
  state: {
    viewMode: 0, // 0 for editor, 1 for viewer
    blocks: [],
    stages: [
      {
        id: 1,
        name: "Input"
      },
      {
        id: 2,
        name: "Activity"
      },
      {
        id: 3,
        name: "Output"
      },
      {
        id: 4,
        name: "Outcome"
      },

    ],
    blocksOrdering: {}
  },
  mutations: {
    putViewMode(state, mode) {
      state.viewMode = mode;
    },
    putBlocksOrdering(state, payload) {
      state.blocksOrdering[payload.stageref] = payload.orderedBlockIds;
    },
    removeBlocksOrderingByStage(state, stageId) {
      delete state.blocksOrdering[stageId];
    },
    overwriteBlocks(state, blocks) {
      state.blocks = blocks;
    },
    overwriteStages(state, stages) {
      state.stages = stages;
    },
    overwriteBlocksOrdering(state, blocksOrdering) {
      state.blocksOrdering = blocksOrdering;
    },
    addStage(state, stage) {
      if(state.stages.length >= config.maxStages) {
        alert(`Maximum ${config.maxStages} columns reached.`);
        return ;
      }
      state.stages.push(stage);
      state.blocksOrdering[stage.id] = [];
    },
    removeStage(state, stageId) {
      state.stages.forEach(function(e, i) {
        if (e.id == stageId) {
          delete state.blocksOrdering[e.id];
          state.stages.splice(i, 1);
        }
      });
    },
    /**
     * Update existing stage name
     *
     * @param {*} state
     * @param {*} payload
     * payload = {
     *   id: 0,
     *   key: 'name',
     *   value: 'in progress'
     * }
     */
    putStage(state, payload) {
      state.stages.forEach(function(e, i) {
        if(e.id == payload.id) {
          state.stages[i][payload.key] = payload.value;
        }
      });
    },
    addBlock(state, stageref) {

      var newId = null;
      if(state.blocks.length > 0) {
        newId = state.blocks[state.blocks.length - 1].id + 1;
      }
      else {
        newId = 1;
      }

      var card = {
        id: newId,
        stageref: stageref,
        title: "",
        teaser: "",
        type: "text",
        style: "-default",
        bgcolor: "white",
        txtcolor: "#005EB8"
      };

      //adding the block
      state.blocks.push(card);
      if(!state.blocksOrdering[stageref]) {
        state.blocksOrdering[stageref] = [];
      }
      if(state.blocksOrdering[stageref].indexOf(card.id) === -1) {
        state.blocksOrdering[stageref].push(card.id);
      }
    },
    removeBlock(state, blockId) {
      state.blocks.forEach(function(e, i) {
        if (e.id == blockId) {
          state.blocksOrdering[e.stageref].forEach(function(v, j) {
            if(v == blockId) {
              state.blocksOrdering[e.stageref].splice(j, 1);
            }
          });
          if(state.blocksOrdering[e.stageref].length <= 0) {
            delete state.blocksOrdering[e.stageref];
          }
          state.blocks.splice(i, 1);
        }
      });
    },
    forceRefreshBlocks(state) {
      state.blocks.push({id: 99999, stageref: 99999});
      state.blocks.splice(state.blocks.length - 1, 1);
    },

    /**
     * Change single field of data.
     *
     * @param {*} state
     * @param {*} blockId
     * @param {*} payload
     * payload = {
     *   id: 3,
     *   key: 'stageref',
     *   value: 2
     * }
     */
    putBlock(state, payload) {
      state.blocks.forEach(function(e, i) {
        if(e.id == payload.id) {
          if(payload.key == 'title' && (payload.value == '' || payload.value.match('thisisonlytoforcerefresh'))) {

          }
          else {
            if(payload.key == 'title') {
              payload.value = payload.value.replace(/\r\n|\n/gi, '');
            }
            state.blocks[i][payload.key] = payload.value;
          }
          return;
        }
      });
    }
  },
  actions: {

  }
});
