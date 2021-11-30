var game = TheRoundSumGame(this)();
game.play()

/**
 * The Round Sum: A pure Javascript game
 * Author: Javier L. Arancibia (arancibiajav@gmail.com)
 * Global wrapper
 */
function TheRoundSumGame(globalScope) {
  const TARGET_FRAMES = 30
  let debugState = {}

  /**
   * Game wrapper
   * options.canvasId = canvas
   * options.canvasEl = null
   */
  function GetTheRoundSumGame(options = {}) {
    /**
     * Inner scope variables
     */
    var canvas = options.canvasEl || document.getElementById(options.canvasId || "canvas");
    var ctx = canvas.getContext("2d");

    /**
     * Game state (global)
     */
    var state = newGameState()

    /**
     * Game scope
     * - Available in every function as this (using apply)
     */
    let scope = {
      ctx, canvas, state, input: inputSystem(),
      /**
       * Play new game
       */
      play() {
        resetGameState.apply(scope)
        draw.apply(scope)
        setInterval(() => update.apply(scope), 1000 / TARGET_FRAMES);
        init.apply(scope)
      },
      /**
       * Get current level
       */
      currentLevel: () => scope.state.levels[scope.state.currentLevelIndex],
    }
    return scope
  }

  function inputSystem() {
    let scope = {
      isMouseDown: false
    }
    window.addEventListener('mousedown', () => {
      scope.isMouseDown = true
    })
    window.addEventListener('mouseup', () => {
      scope.isMouseDown = false
    })
    return scope
  }

  /**
   * Switch to game view
   */
  function switchcreateGameView(name, viewItem) {
    this.state.view.leave && this.state.view.leave()
    this.state.view = typeof viewItem === 'function' ? viewItem.apply(this) : viewItem
    this.state.view.init && this.state.view.init()
  }

  /**
   * Creates new game state
   * this => scope
   */
  function newGameState() {
    return {
      //Current view
      view: createMenuView(),
      rankingData: [],
      currentLevelIndex: -1,
      levels: getGameLevels(),
    }
  }

  /**
   * Resets game state
   */
  function resetGameState() {
    this.state = newGameState.apply(this)
  }

  function getGameLevels() {
    return [{
      memorizeRule: "greater",
      circlesCount: 5
    }]
  }

  /**
   * A view has a init,update,draw methods
   * options.init = ()=>{}
   * options.update = ()=>{}
   * options.draw = ()=>{}
   */
  function createView(name, options = {}) {
    return {
      name,
      init: options.init || (()=>{ }),
      update: options.update ||(()=>{ }),
      draw: options.draw || (()=>{ }),
      leave: options.leave || (()=>{ }),
      state: options.state || {}
  }
}

/**
 * Definition of view "game"
 */
function createGameView() {
  let state = {
    title: "Level X",
    showTitle: false,
    titleColorOpacity: 1,
    phase: "waiting",
    memorizeCircles: [],
    topText: "",
  }

  /**
   * Cycle level and switch to "memorize phase"
   */
  function nextLevel() {
    let root = this
    root.state.currentLevelIndex++
    state.phase = 'waiting'
    state.memorizeCircles = generateMemorizeCircles.apply(this, [])
    state.title = `Level ${root.state.currentLevelIndex + 1}`
    state.showTitle = true
    setTimeout(() => {
      anime({
        targets: state,
        titleColorOpacity: 0,
        easing: 'linear',
        complete: function () {
          state.showTitle = false
        },
        update(anim) {
          if (anim.progress > 50 && state.phase === 'waiting') {
            state.phase = "memorize"
            state.topText = `Memorizeme ${({
              greater: 'greater'
            })[root.currentLevel().memorizeRule]}`

            //Hide memorize text after some seconds
            //

          }
        }
      });
    }, 1000)
  }

  return createView.apply(this,['game', {
    state,
    init() {
      console.log("QWE",Object.keys(this))
      //nextLevel.apply(this)
    },
    update() { },
    draw() {
      state.showTitle && drawCenteredText.apply(this, [state.title, {
        color: `rgba(0, 0, 0, ${state.titleColorOpacity})`
      }])

      if (state.phase === 'memorize') {
        drawMultpleCircles.apply(this, [state.memorizeCircles])
      }

      state.topText && drawCenteredText.apply(this, [state.topText, {
        position: 'top'
      }])
    }
  }])
}

/**
 * Game phase: Memorize
 * The player need to memorize a number based on N circles with a radius
 * Easy: lower or greater circle radius
 * Medium: Average radius
 * Hard: Sum of all circle radius
 */
function generateMemorizeCircles() {
  function getRandomCircle() {
    let x = randomIntFromInterval(50, this.canvas.width - 50)
    let y = randomIntFromInterval(50, this.canvas.height - 50)
    let r = randomIntFromInterval(15, 50)
    return {
      x, y, r,
      box: new SAT.Circle(new SAT.Vector(x, y), r + 1.1)
    }
  }

  

  let list = []
  console.log("ASD",typeof this.currentLevel)
  let target = this.currentLevel&& this.currentLevel().circlesCount || 10
  console.log("ASD2")
  debugState.targetCircles = 0
  let tries = 0
  do {
    
    let circle = getRandomCircle()
    if (!list.find(c => SAT.testCircleCircle(circle.box, c.box))) {
      list.push(circle)
      debugState.targetCircles++
    } else {
      tries++
    }
  } while (list.length < target && tries < target * 3)
  return list
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Draw multiple circles
 */
function drawMultpleCircles(circles = []) {
  circles.sort((a, b) => a.z || 0 > b.z || 0 ? 1 : -1).forEach(circle => {
    drawCircle.apply(this, [circle, {
      text: circle.r,
      textColor: 'blue',
      textFont: `${circle.r}pt Calibri`,
      //centered: true
    }])
  })
}


/**
 * Definition of view "menu"
 */
function createMenuView() {
  let onEnterHandler
  function init() {
    /**
     * e.key, e.keyCode
     */
    onEnterHandler = (e) => {
      if (e.key === 'Enter') {

      }
    }
    window.addEventListener('keydown', onEnterHandler)
  }
  function update() {
    if (this.state.input.isMouseDown) {
      switchcreateGameView.apply(this, ['game', createGameView])
    }
  }
  function draw() {
    drawCenteredText.apply(this, ['PLAY'])
  }
  return createView.apply(this,['menu', {
    init, update, draw, leave() {
      window.removeEventListener('keydown', onEnterHandler)
    }
  }])
}

/**
 * Global init funtion
 * - Preload assets
 */
function init() {
  this.state.view.init && this.state.view.init.apply(this)
}

/**
 * Global update function
 */
function update() {
  try {
    /**
     * Game state contains current input state
     */
    this.state.input = { ...this.input }
    /**
     * Update view
     */
    this.state.view.update && this.state.view.update.apply(this)
  } catch (err) {
    console.error(err.stack)
    console.error("GAME_UPDATE_CRASH")
  }
}

/**
 * Global draw function
 */
function draw() {
  try {
    //this.ctx.scale(2, 2);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.state.view.draw && this.state.view.draw.apply(this)


    /**
     * Debug window
     */
    this.ctx.font = "9pt"
    this.ctx.fillStyle = "black";
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    let debugText = JSON.stringify({
      ...this.state,
      ...debugState,
      font: this.ctx.font
    }, null, 4);
    //printAtWordWrap(this.ctx, debugText, this.canvas.width - 200, 10, 10,200)
    //this.ctx.fillText(, this.canvas.width - 200, 10);
    this.ctx.mlFillText(debugText, this.canvas.width - 210, 10, 200, 300, "top", "left", 10);



  } catch (err) {
    console.error(err.stack)
    console.error("GAME_DRAW_CRASH")
    return
  }
  requestAnimationFrame(() => draw.apply(this))
}

/**
 * Draw a circle
 * options.text = ""
 * options.centered = false
 */
function drawCircle(circle, options = {}) {
  let x = options.centered ? this.canvas.width / 2 : circle.x
  let y = options.centered ? this.canvas.height / 2 : circle.y
  this.ctx.beginPath();
  this.ctx.arc(x, y, circle.r, 0, 2 * Math.PI);
  this.ctx.stroke();
  if (options.text) {
    this.ctx.font = options.font || options.textFont || '20pt';
    this.ctx.fillStyle = options.textColor || 'black';
    this.ctx.textAlign = options.textAlign || 'center';
    this.ctx.fillText(options.text, x, y + 4);
    this.ctx.font = '10px sans-serif'
  }
}

/**
 * Draw a centered text
 * options.color = 'black'
 * options.position = 'center'
 */
function drawCenteredText(text, options = []) {
  this.ctx.font = options.font || '9pt';
  this.ctx.fillStyle = options.color || "black";
  this.ctx.textBaseline = 'middle';
  this.ctx.textAlign = 'center';
  let position = options.position || 'center'
  let y
  switch (position) {
    case 'center': y = this.canvas.height / 2; break;
    case 'top': y = 10; break;
    case 'bottom': y = this.canvas.height - 10; break;
  }
  this.ctx.fillText(text, this.canvas.width / 2, y);
}

return GetTheRoundSumGame
}
